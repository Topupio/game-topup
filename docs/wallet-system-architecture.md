# Wallet System Architecture

> **Status**: Implemented, in production
> **Component**: Store-credit wallet — top-ups (UPI + USDT), pay-with-wallet checkout, admin controls, refunds, nightly reconciliation
> **Audience**: Engineers onboarding onto the wallet feature or touching payments/orders code near it

---

## Table of Contents

1. [What this is](#what-this-is)
2. [Core invariant: one path for every balance change](#core-invariant-one-path-for-every-balance-change)
3. [Data model](#data-model)
4. [Backend: files and responsibilities](#backend-files-and-responsibilities)
5. [Flows](#flows)
   - [Top-up via UPI](#top-up-via-upi)
   - [Top-up via USDT (crypto)](#top-up-via-usdt-crypto)
   - [Paying an order from the wallet](#paying-an-order-from-the-wallet)
   - [Refund to wallet](#refund-to-wallet)
   - [Admin manual credit/debit](#admin-manual-creditdebit)
   - [Freeze / unfreeze](#freeze--unfreeze)
6. [Concurrency and idempotency](#concurrency-and-idempotency)
7. [Reconciliation (the nightly audit)](#reconciliation-the-nightly-audit)
8. [Settings and kill switches](#settings-and-kill-switches)
9. [API reference](#api-reference)
10. [Frontend](#frontend)
11. [Known gaps / things to watch](#known-gaps--things-to-watch)

---

## What this is

A store-credit wallet, denominated in INR paise. Customers add money in two ways
(UPI bank transfer verified by an admin, or USDT via NOWPayments), and can spend
that balance to pay for orders instead of using a live payment gateway. There is
**no withdrawal path** — money only ever moves in, or out to pay for something on
the platform, or back to the customer as a refund-to-wallet from an admin.

Every rupee that moves is backed by an append-only ledger row
(`WalletTransaction`), and a nightly job proves the cached balance on `Wallet`
still agrees with the sum of the ledger.

## Core invariant: one path for every balance change

`backend/services/wallet.service.js::applyTransaction()` is the **only** place
`Wallet.balancePaise` is ever written. Every controller — top-up approval, wallet
checkout, admin credit/debit, refund-to-wallet — calls into it rather than
touching the wallet document directly. This is what makes the ledger trustworthy:
if a balance changed, there is exactly one function that could have done it, and
it always writes a ledger row in the same transaction.

Two distinct problems are solved inside `applyTransaction`, by two different
mechanisms:

- **Concurrency** — the "is there enough balance" check lives inside the
  MongoDB update filter (`balancePaise: { $gte: amountPaise }`), so the check and
  the decrement happen as one atomic operation under Mongo's per-document lock.
  Two simultaneous debits cannot both succeed.
- **Partial failure** — the balance update and the ledger insert are two writes,
  so they run inside a Mongo session transaction (`session.withTransaction`). A
  crash between them is impossible; either both land or neither does.

```
applyTransaction({ userId, type, amountPaise, idempotencyKey?, orderId?, topupId?, adminId?, reason?, fx?, withinTxn? })
  1. validate type / amount / (reason required if adminId set)
  2. idempotency pre-check (cheap, best-effort)
  3. getOrCreateWallet (outside the transaction, deliberately)
  4. session.withTransaction:
       a. Wallet.findOneAndUpdate({ user, status: "active", [balancePaise >= amount if debit] },
                                   { $inc: balancePaise, txnSeq })
          -> null means insufficient funds / frozen / missing, disambiguated after the fact
       b. WalletTransaction.create({ ...balanceAfterPaise from step a's return value... })
       c. withinTxn(session, transaction, wallet) — caller's extra writes, same commit
          (e.g. flip the Order to paid, flip the WalletTopup to confirmed)
  5. on unique-index conflict with an idempotencyKey, return the winner's result instead of erroring
```

`credit()` and `debit()` are just named wrappers around `applyTransaction` — the
`type` (from `TXN_TYPES`) is what actually determines direction, via
`isCreditType()`.

## Data model

| Model | File | Purpose |
|---|---|---|
| `Wallet` | `backend/models/wallet.model.js` | One doc per user. Cached `balancePaise`, `txnSeq` (ledger position), `status` (active/frozen). |
| `WalletTransaction` | `backend/models/walletTransaction.model.js` | Append-only ledger. One row per balance change. Mongoose hooks reject any update/delete at the ODM layer. |
| `WalletTopup` | `backend/models/walletTopup.model.js` | A request to add money — UPI or USDT. State machine: `pending → paid → confirmed` (UPI) or `pending → confirmed` (USDT via webhook), with `rejected`/`expired` as terminal failure states. |
| `WalletSettings` | `backend/models/walletSettings.model.js` | Single document: limits, per-method kill switches, the master `enabled` flag. |
| `WalletAudit` | `backend/models/walletAudit.model.js` | One doc per nightly/full reconciliation run — mismatch counts, global totals, status. |

`TXN_TYPES` (in `walletTransaction.model.js`):

- Credit: `credit_topup`, `credit_refund`, `credit_manual`, `credit_promo`, `credit_referral`
- Debit: `debit_order`, `debit_manual`

Money is always an integer number of paise. `amountPaise` is always positive;
`deltaPaise` is the signed version (`+amount` for credit, `-amount` for debit) so
the audit job can sum one field without branching on type.

## Backend: files and responsibilities

```
backend/
  models/
    wallet.model.js               Wallet doc (balance, status, txnSeq)
    walletTransaction.model.js    Append-only ledger + TXN_TYPES
    walletTopup.model.js          Top-up request/state machine
    walletSettings.model.js       Limits + kill switches (singleton)
    walletAudit.model.js          Reconciliation run records
  services/
    wallet.service.js             applyTransaction/credit/debit/getOrCreateWallet — THE balance-change path
    walletTopup.service.js        Ref generation, IST daily-cap math, amount-limit checks
    walletPricing.service.js      Order <-> paise conversion for debit and refund amounts
  controllers/
    wallet.controller.js          Customer: balance, ledger, top-up history, public settings
    walletTopup.controller.js     Customer: initiate/submit UPI top-up · Admin: approve/reject
    walletCrypto.controller.js    Customer: initiate USDT top-up · NOWPayments webhook handler
    walletPayment.controller.js   Customer: quote + pay an order from the wallet
    walletRefund.controller.js    Admin: refund a paid order to the customer's wallet
    walletAdmin.controller.js     Admin: list wallets, manual credit/debit, freeze, settings, audit trigger
  jobs/
    auditWalletBalances.js        Nightly reconciliation + integrity checks
    expireWalletTopups.js         Sweeps abandoned pending/paid top-ups
    cronScheduler.js               Wires both into node-cron
  routes/
    wallet.routes.js               /api/wallet/**
  (payment.routes.js and order.routes.js also mount wallet-pay and refund-to-wallet endpoints)
```

## Flows

### Top-up via UPI

1. `POST /api/wallet/topups/upi/initiate` — checks `enabled`/`upiTopupEnabled`,
   validates amount against limits and the IST daily cap, checks the wallet isn't
   frozen and won't exceed `maxBalancePaise`, caps open top-ups at 3, then creates
   a `WalletTopup` (`status: pending`) with a UPI deep link/QR payload.
2. Customer pays externally and calls
   `POST /api/wallet/topups/:id/utr` with the 12-digit UTR. The topup moves to
   `status: paid`. A UTR is globally unique across both wallet top-ups and orders
   (checked against `Order.paymentInfo.utrNumber` too) — one UTR can't be reused.
3. Admin reviews the queue (`GET /api/wallet/admin/topups`) and calls
   `POST /api/wallet/admin/topups/:id/approve`. This re-checks the daily cap (the
   real check — the one at step 1 is advisory), then calls `applyTransaction`
   with `type: credit_topup`, `idempotencyKey: topup:<id>` (so re-clicking approve
   is a no-op), and a `withinTxn` callback that flips the topup to `confirmed` in
   the same commit.
4. Rejecting (`.../reject`) requires an admin note and never touches the balance.

### Top-up via USDT (crypto)

1. `POST /api/wallet/topups/usdt/initiate` — same guardrails as UPI, plus a
   crypto-specific minimum (NOWPayments' own floor, converted to paise). Calls
   `nowpayments.service.js::createTopupInvoice`, stores the invoice id/URL on the
   `WalletTopup`, locks the FX rate used at invoice time.
2. NOWPayments calls back `POST /api/payments/nowpayments/wallet-webhook`
   (`walletCrypto.controller.js::handleWalletWebhook`) — HMAC-verified, mounted
   with `express.raw()` and exempted from CSRF in `app.js`. **Always returns 200**
   even on internal failure, to stop NOWPayments' retry storms; real failures are
   logged as `[WALLET-IPN-FAIL]` for a human to find.
3. On a finished/partial payment it calls `applyTransaction` with
   `type: credit_topup` and `idempotencyKey: nowpayments:<paymentId>` — keyed on
   the provider's payment id so a retried webhook can never double-credit. A
   partial payment credits only what actually arrived (converted and floored),
   never more than requested.

### Paying an order from the wallet

`backend/controllers/walletPayment.controller.js`, mounted under
`/api/payments/wallet/*`.

1. `GET /api/payments/wallet/quote?orderId=` — returns the exact paise that will
   be debited (via `walletPricing.service.js::getOrderDebitPaise`, which rounds
   up so the platform is never shorted a fraction of a paisa) and whether the
   balance covers it.
2. `POST /api/payments/wallet/pay` — body is just `{ orderId }`, nothing else is
   client-controlled. Calls `applyTransaction` with `type: debit_order`,
   `idempotencyKey: order_pay:<orderId>`, and a `withinTxn` that flips the order
   to `paid`/`paymentMethod: "wallet"` and snapshots the FX rate used into
   `order.paymentBreakdown.wallet` — needed later so a refund can reproduce the
   exact original amount. External fulfilment (`placeExternalOrderIfEligible`)
   runs **after** the commit, on a freshly re-read order, because the transaction
   callback can in principle be retried and an external side effect must not
   fire twice.

### Refund to wallet

`backend/controllers/walletRefund.controller.js`, mounted under
`/api/orders/admin/:id/refund-to-wallet` (admin only).

This is store credit, not a reversal of the original payment method — PayPal,
UPI, or crypto is never touched. `walletPricing.service.js::resolveRefundablePaise`
decides how much can be refunded and where that number comes from:
- **wallet-paid orders** — reuse the exact `debit_order` ledger row's amount, no
  conversion, no drift.
- **UPI-paid orders** — the rupee amount is already on the order.
- **PayPal/crypto orders** — charged in USD with no recoverable historical rate,
  so this is the one case that converts at *today's* rate; the response flags
  `convertedAtTodaysRate: true` so the admin UI can be honest about it.

Refunds are partial-safe: `order.refund.entries` tracks each refund event,
`idempotencyKey: refund:<orderId>:<entryIndex>` makes a double-submit of the same
entry a no-op, and an optimistic `$size: entryIndex` guard aborts if a second
refund landed concurrently rather than paying out twice.

#### Nothing refunds automatically

There is no cron, webhook, cancellation hook or delivery-failure trigger that
credits a wallet. `refundOrderToWallet` has exactly one production caller — an
admin submitting `RefundToWalletModal` on the order detail page. Every refund is a
deliberate human action with a mandatory reason attached.

This is enforced, not merely conventional: `order.controller.js` rejects any attempt
to set `orderStatus`/`paymentStatus` to `refunded` through the generic order-update
endpoint, because that would mark an order refunded without moving money or writing
a ledger row. `refunded` is reachable only through the refund endpoint.

If auto-refund on cancellation is ever wanted, it does not exist today and is new work.

#### When a refund is refused

| Condition | Status | Response |
|---|---|---|
| `paymentStatus !== "paid"` | 400 | `Only paid orders can be refunded. This one is <status>.` |
| Order already fully refunded | 409 | `This order is already fully refunded` |
| Wallet-paid order with no matching `debit_order` row | 409 | `...paid from a wallet but has no matching debit` |
| Order currency not configured in exchange rates | 422 | `CurrencyError` from `convertAmount` |
| `amountPaise` above the remaining balance | 400 | `At most <amount> can still be refunded on this order` |
| Missing or blank `reason` | 400 | `A reason is required` |
| Recipient wallet is frozen | 423 | `This wallet is frozen` |
| A concurrent refund committed first | 409 | `Another refund was recorded while this one was in progress` |

Pending and failed payments are refused because that money never arrived —
refunding it would be issuing free credit.

Note the frozen case: `applyTransaction` filters on `status: "active"` for credits
as well as debits, so freezing an account blocks money flowing **in** as well as out.
Relevant when freezing an account during a dispute that may end in a refund.

Omitting `amountPaise` refunds the entire remaining balance, which is the common
case. `paymentStatus` and `orderStatus` flip to `refunded` only once accumulated
partials reach the original amount.

`GET /api/orders/admin/:id/refund-quote` returns the refundable figure, how it was
derived, and the fixed reason list: *Incorrect login details*, *Delivery failed*,
*Out of stock*, *Customer cancelled*, *Goodwill*.

### Admin manual credit/debit

`walletAdmin.controller.js::adjustWallet` → `POST /api/wallet/admin/wallets/:userId/credit`
or `.../debit`. A `reason` is mandatory (enforced by the controller *and* by a
Mongoose pre-validate hook on `WalletTransaction` — belt and suspenders, since the
ledger row is the only lasting record once the 30-day admin activity log expires).
Credits are still checked against `maxBalancePaise`.

Reached from `WalletAdjustModal`, opened from either admin surface (see
[Frontend](#frontend)). The modal is UI over the endpoints and holds no rules of
its own: it caps a debit at the current balance and blocks submission without a
reason, but both limits exist server-side regardless. A debit larger than the
balance is refused by the `balancePaise: { $gte: amountPaise }` clause inside
`applyTransaction`'s conditional update, which returns `INSUFFICIENT_FUNDS` (422).

There is deliberately **no clamp-to-zero behaviour**. Debiting "whatever is left"
when the requested amount exceeds the balance would write a ledger row whose
amount differs from the one the admin asked for, and would need a second balance
path to implement — both of which this system is built to prevent. An
over-balance debit fails and the admin decides what to do.

### Freeze / unfreeze

`PATCH /api/wallet/admin/wallets/:userId/status` sets `Wallet.status`. A frozen
wallet fails the `status: "active"` filter inside `applyTransaction`'s conditional
update, so **every** debit and credit path is blocked automatically — there's no
separate "is frozen" branch to keep in sync.

## Concurrency and idempotency

- **Concurrency**: the balance check and the write are the same atomic Mongo
  operation (see [Core invariant](#core-invariant-one-path-for-every-balance-change)).
- **Idempotency**: every caller that can plausibly be retried or double-submitted
  passes an `idempotencyKey`. Two layers enforce it:
  1. A cheap pre-check (`findByIdempotencyKey`) before opening a transaction, to
     avoid the cost of one for a request already handled.
  2. A **partial unique index** on `WalletTransaction.idempotencyKey` (not sparse
     — sparse would still index Mongoose's explicit `null`s and collide) is the
     real guarantee. On a unique-index violation inside the transaction, the
     loser simply looks up and returns the winner's result.
- Backend has standalone concurrency/idempotency check scripts for manual
  verification: `backend/scripts/walletConcurrency.check.js`,
  `walletIdempotency.check.js`, `walletLedger.check.js`, `walletTopupFlow.check.js`,
  `walletRefund.check.js`, `walletCrypto.check.js`.

## Reconciliation (the nightly audit)

`backend/jobs/auditWalletBalances.js`, run by `cronScheduler.js` at 3:30 AM IST
daily (full recompute on Sundays, quick check other nights), and available
on-demand via `POST /api/wallet/admin/audit/run`.

- **Quick (nightly) check**: compares `Wallet.balancePaise`/`txnSeq` against the
  newest ledger row's `balanceAfterPaise`/`seq` — one indexed lookup per wallet.
- **Full check**: sums every ledger row for a wallet (`$sum: deltaPaise`) and
  checks the running `seq` has no gaps. Runs weekly, or automatically escalates
  whenever the quick check finds a mismatch.
- **Global check**: total of all `Wallet.balancePaise` must equal the total of
  all `WalletTransaction.deltaPaise` — the platform's total liability must match
  its total ledger, independent of any per-wallet result.
- **Integrity check** (`auditWalletIntegrity`): three targeted queries for bugs
  the balance-sum check can't see — a `WalletTopup` marked `confirmed` with no
  linked ledger row, an order paid via wallet with no matching `debit_order` row
  (free goods), and any admin-initiated ledger row missing its reason.

Results are persisted as a `WalletAudit` document and surfaced at
`GET /api/wallet/admin/audit/latest`, which also flags a run as `isStale` if none
has completed in the last 36 hours — a job that silently stopped is treated as
worse than one that's actively reporting problems.

## Settings and kill switches

Single `WalletSettings` document (`backend/models/walletSettings.model.js`):

| Field | Meaning |
|---|---|
| `enabled` | Master switch — everything customer-facing is gated behind it. |
| `upiTopupEnabled`, `usdtTopupEnabled`, `walletPaymentEnabled` | Per-method switches. |
| `minTopupPaise` / `maxTopupPaise` | Per-transaction top-up bounds. |
| `dailyTopupCapPaise` | Per-user daily top-up ceiling, resets at IST midnight. |
| `maxBalancePaise` | Stored-credit ceiling — there's no withdrawal, so this bounds how much a customer can have that they can't get back except by spending it. |
| `topupExpiryMinutes` | How long a `pending` top-up stays claimable before the expiry sweep marks it `expired`. |

Public, non-sensitive subset exposed at `GET /api/wallet/settings/public` for the
Add Money screen. Full settings via `GET`/`PUT /api/wallet/admin/settings`.

## API reference

All under `/api/wallet` unless noted.

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/settings/public` | Public | Limits + enabled methods for Add Money UI |
| GET | `/me` | Customer | Balance (+ optional display-currency conversion) |
| GET | `/me/transactions` | Customer | Paginated ledger |
| GET | `/me/topups` | Customer | Paginated top-up history |
| POST | `/topups/upi/initiate` | Customer | Start a UPI top-up |
| POST | `/topups/usdt/initiate` | Customer | Start a USDT top-up |
| POST | `/topups/:id/utr` | Customer | Submit UTR for a UPI top-up |
| GET | `/topups/:id` | Customer | Poll a single top-up |
| GET | `/admin/stats` | Admin | Total liability, wallet count, pending/today counts |
| GET | `/admin/topups` | Admin | Top-up review queue |
| POST | `/admin/topups/:id/approve` | Admin | Approve + credit |
| POST | `/admin/topups/:id/reject` | Admin | Reject (note required) |
| GET | `/admin/transactions` | Admin | Global ledger, filterable |
| GET | `/admin/wallets` | Admin | List wallets (search by name/email) |
| GET | `/admin/wallets/:userId` | Admin | One wallet + recent activity |
| GET | `/admin/wallets/:userId/transactions` | Admin | One user's full ledger |
| POST | `/admin/wallets/:userId/credit` | Admin | Manual credit (reason required) |
| POST | `/admin/wallets/:userId/debit` | Admin | Manual debit (reason required) |
| PATCH | `/admin/wallets/:userId/status` | Admin | Freeze / unfreeze |
| GET/PUT | `/admin/settings` | Admin | Read/update wallet settings |
| GET | `/admin/audit/latest` | Admin | Latest reconciliation result |
| POST | `/admin/audit/run` | Admin | Trigger reconciliation now |

Outside `/api/wallet`:

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/payments/wallet/quote` | Customer | Exact debit amount + sufficiency for an order |
| POST | `/api/payments/wallet/pay` | Customer | Pay an order from the wallet |
| POST | `/api/payments/nowpayments/wallet-webhook` | Public (HMAC) | Crypto top-up provider callback |
| GET | `/api/orders/admin/:id/refund-quote` | Admin | What can still be refunded, and from where |
| POST | `/api/orders/admin/:id/refund-to-wallet` | Admin | Refund a paid order to wallet credit |

## Frontend

```
frontend/src/
  context/WalletContext.tsx                  Global balance + settings, exposes useWallet()
  services/wallet/
    types.ts                                  Shared types — mirrors the backend response shapes exactly
    walletApi.client.ts                        Customer-facing API calls
    walletAdminApi.client.ts                   Admin-facing API calls
  components/user/wallet/
    WalletPageClient.tsx                       /account/wallet — balance card + paginated ledger
    SidebarWalletCard.tsx                      Balance shown in the account sidebar
    AddMoneyFlow.tsx                           /account/wallet/add — amount + method picker (UPI/USDT)
    UpiTopupPanel.tsx                          QR/deep-link display, UTR submission, polling
    WalletCheckout.tsx                         Pay-with-wallet widget, embedded in checkout
    TransactionList.tsx, WalletAmount.tsx      Ledger row rendering, paise formatting
  components/admin/wallet/
    WalletTabs.tsx                             Queue / Wallets / Transactions / Settings tab nav
    AdminTopupQueue.tsx, TopupDecisionModal.tsx Review queue, approve/reject with note
    AdminWalletsList.tsx                       Per-customer balances, ranked by balance
    AdminWalletTransactions.tsx                Global ledger, filterable
    AdminWalletSettings.tsx                    Limits, kill switches, audit trigger
    WalletAdjustModal.tsx                      Manual credit/debit with a mandatory reason
    WalletStatsBar.tsx                         Liability/wallet-count/pending stat tiles
  components/admin/orders/
    RefundToWalletModal.tsx                    Refund a paid order to wallet credit
  app/(user)/account/wallet/{page,add}/page.tsx
  app/admin/wallet/{page,wallets,transactions,settings}/page.tsx
```

**Admin Wallets tab** (`/admin/wallet/wallets`) answers "who holds our store
credit" — the per-customer breakdown of the liability total that `WalletStatsBar`
shows in aggregate. Two constraints worth knowing before changing it:

- `listWallets` sorts by `balancePaise` descending **server-side with no sort
  parameter**. The UI therefore has no sortable column headers — a `#` rank column
  and a "ranked by balance, highest first" line state the ordering instead of
  faking a control that cannot work.
- The endpoint caps `limit` at 50 while the shared `Pagination` component offers
  100, so `onLimitChange` clamps to 50. Without the clamp, picking 100 silently
  returns 50 rows and the page count is wrong.

Rows link to `/admin/wallet/transactions?userId=<id>`; `AdminWalletTransactions`
reads that param and renders a dismissible chip naming the customer, so an admin
arriving there knows why the ledger is short. `useSearchParams` puts that page
behind a `Suspense` boundary in its `page.tsx`.

**`WalletAdjustModal`** is the only UI for manual credit/debit, and is opened from
both admin surfaces — a per-row *Adjust* action in `AdminWalletsList`, and an
*Adjust balance* button in `AdminWalletTransactions`' customer chip row (shown
only when the ledger is filtered to one customer). It defaults to debit, since
correcting a credit made in error is the case it was built for.

The two callers differ in where the balance comes from, and that drives the
`balancePaise: number | null` prop:

- `AdminWalletsList` already holds `balancePaise` and `status` on every row, so it
  passes them straight in and the dialog opens populated.
- `AdminWalletTransactions` filters by user but never loads a wallet — the
  customer's name there is derived from whichever ledger rows happen to be
  loaded. It therefore calls `getUserWallet(userId)` when the dialog opens and
  passes `null` until that resolves, which the modal renders as a loading state.
  `getUserWallet` goes through `getOrCreateWallet`, so a wallet object always
  comes back even for a customer who has never held credit.

The amount is entered in rupees (what an admin reads off a receipt) and converted
with `Math.round(Number(input) * 100)` — the endpoints take whole paise and reject
anything else. A frozen wallet shows a notice and disables submission, matching
the 423 that `applyTransaction` would return anyway. Server error codes are
surfaced by name rather than as a generic failure: `INSUFFICIENT_FUNDS`,
`WALLET_FROZEN`, `MAX_BALANCE_EXCEEDED`.

Both endpoints return the new `balancePaise`, but each caller refetches its list
rather than patching state from it — the ledger needs the new row regardless, and
on the wallets list the balance cell should come from the same query as the rest
of the table.

**`WalletContext`** wraps the app and centralizes `getBalance()` +
`getSettings()` so any component can read wallet state via `useWallet()` without
its own fetch — `WalletPageClient`, `SidebarWalletCard`, and `AddMoneyFlow` all
consume it, and call `refresh()` after an action changes the balance.

**Customer flow** mirrors the backend one-to-one:
`AddMoneyFlow` → `startUpiTopup`/`startCryptoTopup` → for UPI, `UpiTopupPanel`
shows the QR/deep-link and posts the UTR (`submitUtr`), then polls `getTopup`
until the admin approves it; for USDT it redirects straight to the NOWPayments
invoice URL and lets the webhook do the crediting. `WalletPageClient` is the
landing page (`/account/wallet`) showing balance + ledger; `WalletCheckout` is
embedded inside `components/user/gameDetails/PaymentModal.tsx` as one of the
payment options at order checkout — it fetches the exact debit quote
(`quotePayment`) and never computes the charge amount client-side, only submits
`orderId` to `payWithWallet`.

**Admin flow**: `WalletTabs` gates four admin pages — the top-up review queue
(`AdminTopupQueue` + `TopupDecisionModal` for approve/reject with a note), the
per-customer balances (`AdminWalletsList`), the global ledger
(`AdminWalletTransactions`, filterable by user/type/date), and settings
(`AdminWalletSettings`, also where `getLatestAudit`/audit trigger lives).
`WalletAdjustModal` hangs off the middle two. `WalletStatsBar` surfaces
`getStats()` (total liability, wallet count, pending top-ups, top-ups today) at
the top of the admin section.

All frontend types (`WalletTransactionType`, `TopupStatus`, `TopupMethod`, the
response shapes) mirror the backend models/enums directly — there is no
separate frontend notion of a transaction type or status.

## Known gaps / things to watch

- **No withdrawal path** — by design; `maxBalancePaise` exists specifically
  because credit can't be cashed back out.
- **Manual debit has no approval step** — a single admin can take credit off a
  customer with nothing but a typed reason, and the customer is not notified. The
  ledger row makes it attributable after the fact, not preventable. If manual
  debits ever become routine rather than corrective, a second-approver step is
  the obvious next control.
- **`WalletTransaction` append-only enforcement is at the ODM layer only** — a
  direct driver or `mongosh` connection can still bypass the pre-hooks. Real
  protection would be a DB user without update/delete grants on that collection.
- **UPI top-up approval trusts the admin's visual UTR check** — there's no
  automated bank-statement reconciliation; the ledger only proves the *wallet*
  side is internally consistent, not that the UTR was real.
- **Crypto webhook always returns 200** — intentional (stops retry storms), but
  means a bug here fails silently from NOWPayments' point of view; watch
  `[WALLET-IPN-FAIL]` logs.
- **Freezing a wallet blocks credits, not just debits** — the `status: "active"`
  filter in `applyTransaction` is deliberately on the single path every balance
  change takes, so a frozen wallet also rejects refunds, top-up approvals and
  manual credits with a 423. Usually what you want; occasionally surprising when
  an account is frozen during a dispute that then resolves in a refund. Unfreeze
  first, refund, re-freeze if still needed.
