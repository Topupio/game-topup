# Product Requirements Document (PRD)

# Desktop Bulk Email Automation Application

**Platform:** Windows Desktop (Electron.js + Node.js)
**Version:** 1.0
**Date:** 2026-02-24

---

## 1. Project Overview

A Windows desktop-based bulk email automation system built with Electron.js. The application runs entirely on the user's machine with zero cloud infrastructure dependency.

**Core Capabilities:**

- Upload multiple sender email accounts (50+ accounts with app passwords)
- Upload bulk customer email lists
- Upload multiple promotional templates
- Dynamic subject and body randomization
- Automated distributed sending from multiple sender accounts
- Real-time sending dashboard
- Failure detection and sender auto-removal
- Crash recovery and campaign resume
- Logging and reporting

The application is fully offline-installed (no browser dependency) and optimized for high deliverability and performance.

---

## 2. Objective

Build a scalable bulk email engine that:

- Distributes email load across multiple sender accounts
- Prevents sender blocking via rotation
- Randomizes content to reduce spam detection
- Provides real-time visibility of sending process
- Automatically handles sender failures
- Survives crashes and resumes without data loss or duplicates

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Desktop Framework | Electron.js |
| Backend Engine | Node.js |
| UI | React.js (inside Electron) |
| Email Sending | Nodemailer (SMTP based) |
| CSV Processing | fast-csv / csv-parser |
| Local Database | SQLite (WAL mode) |
| Concurrency | Node.js worker_threads |
| Job Queue | BetterQueue (SQLite-backed) |
| IPC Communication | Electron IPC (main <-> renderer) |
| Logging | Winston |
| Packaging | Electron Builder |

---

## 4. System Architecture

### 4.1 High-Level Flow

```
User -> Electron UI (React) -> IPC Bridge -> Node Main Process -> Worker Pool -> SMTP Providers -> Recipient
```

### 4.2 Internal Flow

1. Upload Sender Accounts CSV
2. Upload Customer CSV
3. Upload Templates
4. Configure Sending Settings
5. Start Campaign
6. Job Queue distributes work to Worker Pool
7. Workers send emails via SMTP
8. SQLite tracks every email status in real-time
9. Live Monitoring via IPC updates to React UI
10. Logging + Reporting

### 4.3 Process Architecture (Electron)

```
┌─────────────────────────────────────┐
│          Renderer Process           │
│          (React UI)                 │
│  - Dashboard                        │
│  - Template Editor                  │
│  - Campaign Builder                 │
│  - Reports                          │
└──────────────┬──────────────────────┘
               │ IPC Bridge
┌──────────────▼──────────────────────┐
│          Main Process               │
│          (Node.js)                  │
│  - Campaign Controller              │
│  - Job Queue Manager                │
│  - SQLite Database                  │
│  - Graceful Shutdown Handler        │
│  - SMTP Connection Pool Manager     │
└──────────────┬──────────────────────┘
               │ worker_threads
┌──────────────▼──────────────────────┐
│          Worker Pool                │
│  - Worker 1 (Sender Account A)      │
│  - Worker 2 (Sender Account B)      │
│  - Worker 3 (Sender Account C)      │
│  - ...up to N workers               │
│  Each worker:                       │
│    - Holds persistent SMTP conn     │
│    - Picks jobs from queue          │
│    - Reports status back to main    │
└─────────────────────────────────────┘
```

---

## 5. Concurrency Architecture

### 5.1 Worker Thread Pool

The main thread must never handle SMTP connections directly. All email sending happens in worker threads.

- **Pool size:** 1 worker per active sender account (configurable, max 50)
- **Each worker:** Maintains a persistent SMTP connection via Nodemailer transport
- **Communication:** Workers report status (sent/failed/error) back to main process via `parentPort.postMessage()`
- **Memory limit:** Each worker capped at 50MB to prevent RAM exhaustion with 50+ workers
- **Lifecycle:** Workers are spawned when campaign starts, terminated when campaign ends or sender is disabled

### 5.2 Job Queue System

A local persistent job queue manages all email tasks.

- **Backed by SQLite** — survives app restarts and crashes
- **Features:**
  - Retry logic (configurable, default 3 retries)
  - Per-sender rate limiting
  - Pause / Resume / Cancel support
  - Priority ordering
  - Dead letter queue for permanently failed jobs
- **Job states:** `PENDING` -> `QUEUED` -> `IN_PROGRESS` -> `SENT` | `FAILED` | `RETRYING` | `SKIPPED`

### 5.3 SMTP Connection Pool Manager

- Reuse SMTP connections — do NOT reconnect per email
- One persistent Nodemailer transport per sender account
- Connection health check before sending (verify())
- Auto-reconnect on transient failures
- Close idle connections after configurable timeout

### 5.4 IPC Bridge (Main <-> Renderer)

- Main process sends real-time updates to React UI via `ipcRenderer`
- Batched updates (every 500ms) to avoid UI flooding
- Events: `email:sent`, `email:failed`, `sender:disabled`, `campaign:progress`, `campaign:complete`

---

## 6. Crash Recovery and State Persistence

### 6.1 SQLite State Tracking

Every email is tracked row-by-row in SQLite:

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| campaign_id | TEXT | Campaign reference |
| recipient_email | TEXT | Target email |
| recipient_data | JSON | First name, last name, custom fields |
| sender_email | TEXT | Which sender was used (null if pending) |
| template_id | TEXT | Which template was used |
| subject_used | TEXT | Actual subject sent |
| status | TEXT | PENDING / QUEUED / SENT / FAILED / RETRYING / SKIPPED |
| attempts | INTEGER | Number of send attempts |
| error_message | TEXT | Error details if failed |
| sent_at | DATETIME | Timestamp of successful send |
| created_at | DATETIME | When job was created |

### 6.2 SQLite WAL Mode

SQLite must run in **WAL (Write-Ahead Logging) mode**:

- Allows concurrent reads from UI while workers write
- Prevents database corruption on sudden shutdown
- Significantly better performance for concurrent access

### 6.3 Campaign Resume Logic

On app startup:

1. Check for campaigns with status `IN_PROGRESS`
2. Query all rows where status is `PENDING`, `QUEUED`, or `RETRYING`
3. Re-queue those jobs into the job queue
4. Resume sending from where it stopped
5. Already `SENT` rows are skipped — no duplicates

**Worst case on hard crash:** 1 duplicate email (the one mid-send at the moment of crash). Acceptable.

### 6.4 Graceful Shutdown Handler

When user closes the app normally:

1. Stop accepting new jobs
2. Wait for all in-progress sends to complete (timeout: 30 seconds)
3. Mark remaining queued jobs back to `PENDING`
4. Close all SMTP connections
5. Close SQLite database cleanly
6. Exit app

---

## 7. Detailed Workflow

### STEP 1: Upload Sender Accounts

**CSV Format:**

| Email | App Password | SMTP Host | Port |
|---|---|---|---|
| example@gmail.com | xxxx xxxx xxxx | smtp.gmail.com | 587 |

**System will:**

- Validate SMTP credentials (attempt connection + verify())
- Store securely in encrypted local database
- Mark status as `ACTIVE`
- Record initial health score of 100

### STEP 2: Upload Customer List

**CSV Format:**

| First Name | Last Name | Email | Custom1 | Custom2 |
|---|---|---|---|---|

**System will:**

- Validate email format (regex + MX record check)
- Remove duplicates
- Detect invalid domains
- Store in SQLite with campaign reference

### STEP 3: Upload Email Templates

**System will allow:**

- Multiple subject lines
- Multiple body templates
- HTML editor with live preview
- Dynamic placeholders

**Supported placeholders:**

- `{{first_name}}`
- `{{last_name}}`
- `{{email}}`
- `{{custom1}}`
- `{{custom2}}`
- `{{unsubscribe_link}}`

**Randomization logic:**

- Randomly pick subject from list
- Randomly pick template from list
- Replace dynamic variables
- Add slight content variation if enabled (synonym replacement, whitespace variation)

### STEP 4: Sending Logic

**Distribution Logic:**

If 50 sender accounts and 10,000 recipients:

- Emails distributed evenly across all active senders
- Round-robin or randomized sender selection (configurable)
- Rate limit per sender (configurable)

**Default rate limits:**

- 10 emails per minute per sender
- Random delay between sends: 5-15 seconds
- Per-domain throttling (Gmail, Yahoo, Outlook limits respected)

**Sending pipeline per email:**

```
Job Queue -> Pick available worker -> Pick template -> Render content -> Send via SMTP -> Update SQLite -> Notify UI
```

### STEP 5: Live Dashboard

**Dashboard metrics:**

| Metric | Description |
|---|---|
| Total Emails | Total count |
| Sent | Success count |
| Failed | Failed count |
| Active Senders | Currently working |
| Blocked Senders | Auto-disabled |
| Sending Speed | Emails/min (rolling average) |
| Remaining | Pending count |
| ETA | Estimated time to completion |
| Campaign Duration | Elapsed time |

**Live table:**

| Recipient | Sender | Status | Timestamp | Error |
|---|---|---|---|---|

**Status values:** `Pending` | `Sent` | `Failed` | `Retrying` | `Skipped`

**UI updates:** Batched every 500ms via IPC to prevent UI freezing.

### STEP 6: Failure Handling

| SMTP Error | Action |
|---|---|
| Authentication error | Remove sender, mark `BLOCKED` |
| Daily quota exceeded | Disable sender until next day |
| 550 rejected | Mark recipient email as invalid |
| Connection timeout | Retry up to 3 times, then fail |
| Rate limit (429) | Back off sender for configurable duration |
| Network error | Retry with exponential backoff |

**System will:**

- Automatically remove problematic sender from rotation
- Reduce sender health score on failures
- Log detailed reason
- Redistribute pending jobs to remaining active senders
- Continue campaign with remaining accounts
- Alert user if all senders exhausted

---

## 8. Advanced Features

### 8.1 Smart Warm-Up Mode

Gradually increase sending volume per sender account:

- Day 1: 20 emails
- Day 2: 50 emails
- Day 3: 100 emails
- Day 7: Full capacity

Configurable warm-up schedule per sender.

### 8.2 Proxy Support

Optional SMTP-over-proxy for IP diversification. SOCKS5 proxy support per sender account.

### 8.3 Sender Health Score

Track per-sender performance:

- Starting score: 100
- Bounce: -10
- Timeout: -5
- Success: +1 (cap at 100)
- Auto-disable sender below score threshold (configurable, default 30)

### 8.4 Bounce Tracking

IMAP monitoring as a background worker:

- Poll sender inboxes for bounce-back messages
- Parse bounce type (hard bounce vs soft bounce)
- Auto-mark recipients as invalid on hard bounce
- Runs as a separate worker thread

### 8.5 Blacklist Protection

Auto-remove recipients with repeated failures across campaigns. Maintain a local blacklist database.

### 8.6 Campaign Scheduling

- Schedule campaigns for specific date/time
- System tray mode — app runs minimized in background
- Wake and execute at scheduled time

### 8.7 Throttling Control

Custom rate limits per recipient domain:

| Domain | Max per hour | Delay between |
|---|---|---|
| gmail.com | 100 | 10-20s |
| yahoo.com | 80 | 15-25s |
| outlook.com | 80 | 15-25s |
| Custom | Configurable | Configurable |

### 8.8 DKIM/SPF Validation Checker

Warn user if sender domain lacks proper DKIM/SPF/DMARC configuration. Run DNS check on sender domain during account upload.

### 8.9 Attachment Support

- Add attachments per campaign
- File size limit: 10MB per email
- Supported formats: PDF, PNG, JPG, DOCX

### 8.10 Email Preview Simulator

Preview how email renders in Gmail/Outlook/mobile before sending. Uses HTML rendering engine within Electron.

---

## 9. Security Features

- **Encrypted storage** of SMTP credentials (AES-256 encryption, key derived from user-set master password)
- **App password support only** (no normal password storage)
- **No cloud storage** — all data stays on user's machine
- **Local-only SQLite database**
- **Exportable encrypted backup** of configuration and sender accounts
- **Master password** required to unlock the application
- **Auto-lock** after configurable idle timeout

---

## 10. User Interface Modules

| Module | Description |
|---|---|
| Sender Management | Add, remove, test, view health scores of sender accounts |
| Customer Management | Upload, validate, deduplicate, blacklist recipients |
| Template Editor | HTML editor with placeholders, preview, multiple templates |
| Campaign Builder | Configure campaign: select senders, recipients, templates, rate limits |
| Live Sending Console | Real-time dashboard with metrics, live table, pause/resume controls |
| Reports & Analytics | Post-campaign stats, sender performance, exportable reports |
| Settings | Rate limits, warm-up config, proxy settings, security, backup/restore |
| System Tray | Minimize to tray, background sending, scheduled campaign execution |

---

## 11. Database Schema

### campaigns

| Column | Type |
|---|---|
| id | TEXT (UUID) |
| name | TEXT |
| status | TEXT (DRAFT / RUNNING / PAUSED / COMPLETED / CANCELLED) |
| total_recipients | INTEGER |
| sent_count | INTEGER |
| failed_count | INTEGER |
| created_at | DATETIME |
| started_at | DATETIME |
| completed_at | DATETIME |
| settings | JSON (rate limits, delays, warm-up config) |

### senders

| Column | Type |
|---|---|
| id | TEXT (UUID) |
| email | TEXT |
| password_encrypted | BLOB |
| smtp_host | TEXT |
| smtp_port | INTEGER |
| status | TEXT (ACTIVE / BLOCKED / DISABLED / QUOTA_EXCEEDED) |
| health_score | INTEGER (0-100) |
| daily_sent_count | INTEGER |
| last_used_at | DATETIME |

### recipients

| Column | Type |
|---|---|
| id | TEXT (UUID) |
| campaign_id | TEXT (FK) |
| email | TEXT |
| first_name | TEXT |
| last_name | TEXT |
| custom_fields | JSON |
| is_blacklisted | BOOLEAN |

### email_jobs

| Column | Type |
|---|---|
| id | TEXT (UUID) |
| campaign_id | TEXT (FK) |
| recipient_id | TEXT (FK) |
| sender_id | TEXT (FK, nullable) |
| template_id | TEXT (nullable) |
| subject_used | TEXT |
| status | TEXT (PENDING / QUEUED / IN_PROGRESS / SENT / FAILED / RETRYING / SKIPPED) |
| attempts | INTEGER |
| error_message | TEXT |
| sent_at | DATETIME |
| created_at | DATETIME |

### templates

| Column | Type |
|---|---|
| id | TEXT (UUID) |
| campaign_id | TEXT (FK) |
| name | TEXT |
| subject_lines | JSON (array of strings) |
| body_html | TEXT |
| attachments | JSON |

### blacklist

| Column | Type |
|---|---|
| email | TEXT (PK) |
| reason | TEXT |
| added_at | DATETIME |

---

## 12. Reports Export

**Post-campaign exports:**

**CSV Export:**

| Email | Status | Sender | Error | Timestamp |
|---|---|---|---|---|

**PDF Summary Report:**

- Campaign name and date
- Total sent / success rate / failure rate
- Sender performance breakdown (emails sent, bounce rate, health score)
- Top failure reasons
- Domain-wise delivery stats

---

## 13. Compliance

- **Unsubscribe link support** — `{{unsubscribe_link}}` placeholder auto-injected
- **CAN-SPAM compliance** — physical address field, clear identification
- **Opt-out handling** — process unsubscribe requests, add to blacklist
- **GDPR consideration** — all data stored locally, user controls deletion

---

## 14. Deliverables

| Deliverable | Description |
|---|---|
| Windows Installer (.exe) | Electron Builder packaged installer |
| Admin Manual | How to use the application |
| CSV Format Documentation | Required CSV formats for senders, recipients |
| Setup Guide | Installation and first-run configuration |
| Database Backup Tool | Export/import encrypted backups |

---

## 15. Infrastructure Requirements

| Requirement | Cost |
|---|---|
| Cloud servers | **None** — runs entirely on user's PC |
| Hosting | **None** — distributed as .exe installer |
| Database server | **None** — SQLite embedded |
| Code signing certificate | ~$70-200/year (recommended) |
| Auto-update hosting | Free (GitHub Releases) |
| **Total monthly cost** | **$0-10/month** |

---

## 16. Minimum System Requirements (User's PC)

| Requirement | Specification |
|---|---|
| OS | Windows 10 or later |
| RAM | 4GB minimum, 8GB recommended |
| Storage | 500MB for app + space for logs/database |
| CPU | Dual-core minimum, quad-core recommended |
| Network | Stable internet connection for SMTP |

---

## 17. Risk Mitigation

| Risk | Mitigation |
|---|---|
| App crash mid-campaign | SQLite state persistence + campaign resume on restart |
| Power failure | WAL mode prevents DB corruption, resume from last PENDING |
| All senders blocked | Alert user, pause campaign, suggest adding new senders |
| SQLite database corruption | Auto-backup before each campaign, WAL mode |
| Memory exhaustion (50 workers) | Per-worker memory caps, configurable pool size |
| SMTP provider rate limits | Per-domain throttling, configurable delays |
| Duplicate sends after crash | Row-level status tracking, at-most-once delivery |
