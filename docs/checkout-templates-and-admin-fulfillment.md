# Checkout Templates & Admin Fulfillment Guide

This document explains the **checkout template types** used across the storefront
(`UID Top-Up`, `Login Top-Up`, `Live Apps Top-Up`, `Gift Cards`, `AI & Subscriptions`),
what data each one collects from the customer, **why** they differ, and the
**expected admin response / fulfillment workflow** for each.

> Source of truth: `frontend/src/lib/constants/checkoutTemplates.ts`
> (template field definitions) and `frontend/src/components/admin/orders/OrderDetailPage.tsx`
> (the admin order-handling screen). Templates are also DB-backed (`CheckoutTemplateDoc`)
> and editable from the admin Game form via `CheckoutTemplateSelector.tsx`.

---

## 1. The Big Picture

Every game/product is assigned **one checkout template** (`game.checkoutTemplate`).
The template decides **which input fields the customer fills in at checkout**
(name, type, required/optional). Those values are stored on the order as
`order.userInputs` — an array of `{ label, value }` pairs that the admin reads to
fulfill the order.

The template type is essentially a **fulfillment method**: it tells both the
customer *what to give us* and the admin *how the order will be delivered*.

```
Game ──has──> checkoutTemplate ──renders──> UserDetailsForm (fields)
                                              │
                            customer fills ───┘
                                              ▼
                              Order.userInputs[]  ──read by──> Admin
```

All templates share one common field: **WhatsApp Number** (`whatsapp_number`,
required) — the primary support/delivery contact channel.

---

## 2. Template Types Explained

### 2.1 `uid_topup` — UID Top-Up
**What it means:** The customer owns an in-game account identified by a public
**Player UID** (and sometimes a Zone/Server). Top-up is delivered **directly to the
game account** by the publisher's top-up system — the customer never shares
credentials. This is the safest and most common "instant" category.

**Fields collected:**
| Field | Key | Required | Notes |
|-------|-----|----------|-------|
| WhatsApp Number | `whatsapp_number` | ✅ | Support/delivery contact |
| Player UID | `player_uid` | ✅ | Can be auto-verified (shows "✓ Verified: <name>") |
| Zone/Server | `zone_server` | ⬜ | Configurable per game via template options (`zoneRequired`, `zoneFieldType`, `zoneOptions`) |

**Special behavior:** The Player UID field supports **live verification** — when
the customer enters a UID, the system can resolve and display the in-game nickname
so they (and the admin) can confirm it's the correct account.

---

### 2.2 `login_topup` — Login Top-Up
**What it means:** The game has **no public UID-based top-up**, so the customer
must hand over **account login credentials** and the admin logs into the account
to apply the top-up manually. This is the **most sensitive** template because it
collects a password.

**Fields collected:**
| Field | Key | Required | Notes |
|-------|-----|----------|-------|
| WhatsApp Number | `whatsapp_number` | ✅ | Support/delivery contact |
| Email/Username | `email_username` | ✅ | Login identifier |
| Password | `password` | ✅ | Account password (handle securely) |
| OTP Method | `otp_method` | ⬜ | Dropdown: Email / SMS / Authenticator — how to retrieve a login OTP |

**Security note:** Credentials are highly sensitive. Admins should fulfill
promptly, and customers should be advised to change their password after delivery.

---

### 2.3 `live_apps_topup` — Live Apps Top-Up
**What it means:** Used for live-streaming / social apps (e.g. live coin recharges)
where the account is identified by a **phone number, account ID, or username**.
Delivery is manual to that account ID. More free-form than UID top-up.

**Fields collected:**
| Field | Key | Required | Notes |
|-------|-----|----------|-------|
| WhatsApp Number | `whatsapp_number` | ✅ | Support/delivery contact |
| Phone / Account ID / Username | `account_id` | ✅ | The recharge target identifier |
| Extra Note | `extra_note` | ⬜ | Free-text special instructions from the customer |

---

### 2.4 `gift_cards` — Gift Cards
**What it means:** The customer is buying a **redeemable code/voucher**, not a
direct account top-up. The deliverable is a **code** that gets sent to the
customer (via email and/or WhatsApp).

**Fields collected:**
| Field | Key | Required | Notes |
|-------|-----|----------|-------|
| WhatsApp Number | `whatsapp_number` | ✅ | Support/delivery contact |
| Email to receive code | `email` | ⬜ | Where the code is delivered |
| Region | `region` | ⬜ | Dropdown — gift card region/locale matters for redemption |

---

### 2.5 `ai_subscriptions` — AI & Subscriptions
**What it means:** Subscription products (AI tools, streaming, software seats).
Often provisioned on the customer's own email/account. The checkout form header
even changes to **"Customer Details"** (vs. "Enter Player Details") for this
template.

**Fields collected:**
| Field | Key | Required | Notes |
|-------|-----|----------|-------|
| WhatsApp Number | `whatsapp_number` | ✅ | Support/delivery contact |
| Email | `email` | ⬜ | Account the subscription is attached to |
| Notes | `notes` | ⬜ | Free-text additional requirements |

---

## 3. Order Status Model

The admin manages two independent statuses on every order
(`frontend/src/services/orders/types.ts`):

**`orderStatus`** (`OrderStatus`):
`pending` → `paid` → `processing` → `completed`
(plus terminal `cancelled`, `failed`, `expired`)

**`paymentStatus`** (`PaymentStatus`):
`pending` → `paid` → `failed` → `refunded`

There is also an admin queue concept `upi_review` (`AdminOrderQueue`) for orders
paid via UPI that need manual UTR verification.

Each status change appends to the order **timeline** (`order.tracking[]`), and the
admin's **note** (`adminNote`, rich text) is **visible to the customer** on their
order page — so it doubles as the customer-facing delivery message.

---

## 4. Expected Admin Response by Template

The general loop is the same for all manual-fulfillment templates:

1. Confirm payment (`paymentStatus = paid`; for UPI verify the submitted UTR).
2. Set `orderStatus = processing` and fulfill using `order.userInputs`.
3. On success set `orderStatus = completed`, optionally attach `completionProof`,
   and write a customer-facing `adminNote`.
4. If it can't be fulfilled, set `cancelled`/`failed` and `refunded` as appropriate.

Template-specific expectations:

| Template | Admin reads (key inputs) | Expected admin action | Customer-facing note (`adminNote`) |
|----------|--------------------------|-----------------------|------------------------------------|
| **UID Top-Up** | `player_uid`, `zone_server` | Verify UID resolves to the right player, push the top-up to that UID/server via the publisher panel/API. | "Top-up delivered to UID `<uid>`. Please restart the game to see your balance." |
| **Login Top-Up** | `email_username`, `password`, `otp_method` | Log into the account (request OTP via the stated method), apply the top-up, then log out. Advise password change. | "Top-up applied to your account. For security, please change your password now." |
| **Live Apps Top-Up** | `account_id`, `extra_note` | Recharge the target phone/account ID, honoring any `extra_note` instructions. | "Recharge sent to `<account_id>`. Coins should appear shortly." |
| **Gift Cards** | `email`, `region` | Procure a valid code for the correct **region**, deliver the code to the customer's email/WhatsApp. | "Your code: `XXXX-XXXX`. Redeem in the `<region>` store." (Consider sending the code privately, not just in the note.) |
| **AI & Subscriptions** | `email`, `notes` | Provision/activate the subscription on the customer's email, fulfilling `notes`. | "Subscription activated on `<email>`, valid until `<date>`." |

### Common admin guardrails
- **Always re-read `userInputs` before fulfilling** — wrong UID/account ID is the
  top cause of failed delivery (the customer form even warns about this).
- **Use the timeline** (`order.tracking`) to keep an auditable history; every
  status change is recorded with a message and timestamp.
- **UPI orders:** don't move to `processing` until the customer's **UTR** is
  submitted and verified (shown in the "UPI Payment Details" panel of the admin
  order page); orders awaiting this sit in the `upi_review` queue.
- **Login Top-Up credentials are sensitive** — fulfill promptly and never echo the
  password back in the customer-facing note.
- **Refunds:** if a top-up can't be delivered (invalid account, region mismatch,
  out of stock), set `paymentStatus = refunded` and `orderStatus = cancelled`,
  and explain why in the note.

---

## 5. How Templates Are Configured (Admin)

Admins assign a template to a game in the Game form via
`CheckoutTemplateSelector.tsx`:
- Pick a template from the dropdown — a **preview** lists each field, its type, and
  whether it's required.
- For **UID Top-Up**, extra options appear: toggle *Zone field required*, choose the
  zone field type (**Dropdown (Server)** vs **Text Input (Zone ID)**), and supply a
  comma-separated list of server options.

The chosen template + options are stored on the game
(`game.checkoutTemplate`, `game.checkoutTemplateOptions`) and drive the customer
checkout form at runtime.

---

## 6. Quick Reference

| Template key | Label | Delivery model | Credentials needed? | Deliverable |
|--------------|-------|----------------|---------------------|-------------|
| `uid_topup` | UID Top-Up | Direct to game UID | No (public UID) | Balance on account |
| `login_topup` | Login Top-Up | Admin logs in | **Yes (password)** | Balance on account |
| `live_apps_topup` | Live Apps Top-Up | Recharge to account ID | No | Coins/balance |
| `gift_cards` | Gift Cards | Send a code | No | Redeemable code |
| `ai_subscriptions` | AI & Subscriptions | Provision on email | Sometimes (email) | Active subscription |
