# NOWPayments Crypto Payment Gateway — Integration Plan

> **Date**: 2026-03-24
> **Status**: Planned
> **API Docs**: https://nowpayments.io/api

---

## 1. Overview

The platform currently supports **PayPal** as the sole payment gateway. This plan covers integrating **NOWPayments** — a non-custodial cryptocurrency payment processor — as a second payment option, allowing users to pay with crypto (BTC, ETH, TRX, USDT, etc.).

### How NOWPayments Works

Unlike PayPal's synchronous popup-and-capture flow, NOWPayments uses an **invoice-based async flow**:

```
User selects "Pay with Crypto"
        ↓
Backend creates NOWPayments invoice (POST /v1/invoice)
        ↓
User is redirected to NOWPayments hosted payment page
        ↓
User sends crypto to the provided wallet address
        ↓
Blockchain confirms the transaction (minutes to hours)
        ↓
NOWPayments sends IPN webhook to our server
        ↓
Backend updates order status → triggers fulfillment
```

---

## 2. Challenges & Considerations

| # | Challenge | Impact | Mitigation |
|---|-----------|--------|------------|
| 1 | **Async payment flow** | PayPal confirms instantly; crypto needs blockchain confirmations (minutes to hours) | Frontend shows "waiting for confirmation" state; rely on IPN webhooks for status updates |
| 2 | **Status lifecycle mismatch** | NOWPayments has 9+ statuses vs our 4 (`pending`, `paid`, `failed`, `refunded`) | Map statuses explicitly (see Section 5) |
| 3 | **Partial payments** | User may send less crypto than required (`partially_paid`) | Keep order as `pending`; log the partial amount; let user complete or let it expire |
| 4 | **No simple refund API** | Crypto refunds can't be automated like PayPal | Handle refunds manually via NOWPayments dashboard; admin marks refund in our system |
| 5 | **Minimum payment amounts** | Each crypto has a minimum threshold (e.g., ~$1 for TRX, ~$5 for BTC) | Check against NOWPayments `/v1/min_amount` endpoint; warn users if order is below minimum |
| 6 | **Webhook signature verification** | Different from PayPal — uses HMAC-SHA512 with IPN secret key | Implement `x-nowpayments-sig` header verification |
| 7 | **CSRF & raw body** | Webhook needs CSRF exemption + raw body for signature verification | Same pattern as existing PayPal webhook in `app.js` |
| 8 | **Currency conversion** | NOWPayments converts fiat→crypto internally | We send USD amount; NOWPayments calculates crypto equivalent |
| 9 | **Payment method selection UI** | Currently shows PayPal buttons directly in modal | Add a payment method selector before showing gateway-specific UI |

---

## 3. NOWPayments API Endpoints We'll Use

### Authentication
- **API Key**: Passed via `x-api-key` header on all requests
- **IPN Secret**: HMAC-SHA512 key for webhook signature verification (generated in NOWPayments dashboard)

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/v1/invoice` | Create a payment invoice with hosted checkout page |
| `GET` | `/v1/payment/{id}` | Check payment status |
| `GET` | `/v1/available_currencies` | List supported cryptocurrencies |
| `GET` | `/v1/min_amount?currency_pair=btc_usd` | Get minimum payment amount for a currency pair |
| `GET` | `/v1/estimate_price` | Estimate crypto amount for a fiat value |

### Create Invoice — Request

```json
{
  "price_amount": 9.99,
  "price_currency": "usd",
  "order_id": "ORD-123456-ABC",
  "order_description": "PUBG Mobile 60 UC",
  "ipn_callback_url": "https://yourdomain.com/api/payments/nowpayments/webhook",
  "success_url": "https://yourdomain.com/orders/ORDER_ID"
}
```

### Create Invoice — Response

```json
{
  "invoice_id": "INV20231027XXXXXX",
  "invoice_url": "https://nowpayments.io/invoice/INV20231027XXXXXX",
  "status": "created",
  "order_id": "ORD-123456-ABC"
}
```

### IPN Webhook — Payload

```json
{
  "payment_id": 123456789,
  "payment_status": "finished",
  "pay_address": "0xabc...",
  "price_amount": 9.99,
  "price_currency": "usd",
  "pay_amount": 15,
  "actually_paid": 15,
  "pay_currency": "trx",
  "order_id": "ORD-123456-ABC",
  "outcome_amount": 14.81,
  "outcome_currency": "trx",
  "fee": {
    "currency": "btc",
    "depositFee": 0.098,
    "withdrawalFee": 0,
    "serviceFee": 0
  }
}
```

### IPN Signature Verification (Node.js)

```javascript
const crypto = require('crypto');

function sortObject(obj) {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = (obj[key] && typeof obj[key] === 'object')
      ? sortObject(obj[key])
      : obj[key];
    return result;
  }, {});
}

const hmac = crypto.createHmac('sha512', IPN_SECRET_KEY);
hmac.update(JSON.stringify(sortObject(requestBody)));
const signature = hmac.digest('hex');

// Compare with req.headers['x-nowpayments-sig']
```

---

## 4. Current Payment Architecture (For Context)

### Existing PayPal Flow
```
Frontend                          Backend                         PayPal
   |                                 |                               |
   |-- POST /api/orders ------------>|  Create order (pending)       |
   |<-- { orderId, _id } -----------|                               |
   |                                 |                               |
   |-- POST /payments/paypal/       |                               |
   |   create-order ---------------->|-- Create PayPal Order ------->|
   |<-- { paypalOrderId } ----------|<-- { id } -------------------|
   |                                 |                               |
   |-- PayPal popup opens --------->|                               |
   |-- User approves in popup       |                               |
   |                                 |                               |
   |-- POST /payments/paypal/       |                               |
   |   capture-order --------------->|-- Capture Order ------------->|
   |<-- { success, order } ---------|<-- { COMPLETED } ------------|
   |                                 |                               |
   |-- Redirect to /orders/:id      |-- Trigger fulfillment         |
```

### Key Files

| File | Purpose |
|------|---------|
| `backend/services/paypal.service.js` | PayPal SDK wrapper (createOrder, captureOrder, refund, webhook verify) |
| `backend/controllers/payment.controller.js` | Payment logic (create, capture, webhook handler, refund) |
| `backend/routes/payment.routes.js` | Payment API routes |
| `backend/models/order.model.js` | Order schema (supports multiple payment method enums) |
| `backend/models/payment.model.js` | Payment record schema (supports multiple gateway enums) |
| `backend/app.js` | Express app with raw body parser + CSRF exemptions for webhooks |
| `frontend/src/components/user/gameDetails/GameDetailsPage.tsx` | Checkout flow + payment modal |
| `frontend/src/components/user/gameDetails/PayPalCheckout.tsx` | PayPal buttons component |
| `frontend/src/services/payments/paymentsApi.client.ts` | Frontend payment API client |
| `frontend/src/config/api.ts` | API endpoint constants |
| `backend/utils/externalOrderPlacer.js` | Auto-places external orders after payment confirmation |

---

## 5. Status Mapping

| NOWPayments Status | Internal `paymentStatus` | Internal `orderStatus` | Action |
|--------------------|--------------------------|------------------------|--------|
| `waiting` | `pending` | `pending` | Update tracking: "Waiting for crypto payment" |
| `confirming` | `pending` | `pending` | Update tracking: "Payment confirming on blockchain" |
| `confirmed` | `pending` | `pending` | Update tracking: "Payment confirmed, processing" |
| `sending` | `pending` | `pending` | Update tracking: "Payment being processed" |
| `finished` | **`paid`** | **`paid`** | Create Payment record + trigger external order fulfillment |
| `partially_paid` | `pending` | `pending` | Log warning; keep pending |
| `failed` | `failed` | `failed` | Update tracking: "Crypto payment failed" |
| `expired` | `failed` | `failed` | Update tracking: "Crypto payment expired" |
| `refunded` | `refunded` | `cancelled` | Update Payment + Order refund fields |

---

## 6. Implementation Steps

### Step 1: Backend Service — `backend/services/nowpayments.service.js` (NEW)

Create a service module mirroring `paypal.service.js` pattern:

- `createInvoice(amount, currency, orderId, successUrl)` — `POST /v1/invoice`
- `getPaymentStatus(paymentId)` — `GET /v1/payment/{id}`
- `verifyIPNSignature(headers, body)` — HMAC-SHA512 verification
- Uses native `fetch` (no SDK dependency needed)
- Reads env vars: `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `NOWPAYMENTS_API_URL`

### Step 2: Update Models

**`backend/models/payment.model.js`**
```diff
  paymentGateway: {
      type: String,
-     enum: ["razorpay", "stripe", "wallet", "binancePay", "paypal"],
+     enum: ["razorpay", "stripe", "wallet", "binancePay", "paypal", "nowpayments"],
  }
```

**`backend/models/order.model.js`**
```diff
  paymentMethod: {
      type: String,
-     enum: ["razorpay", "stripe", "wallet", "binancePay", "paypal"],
+     enum: ["razorpay", "stripe", "wallet", "binancePay", "paypal", "nowpayments"],
  }
```

### Step 3: Backend Controller — `backend/controllers/payment.controller.js`

Add two new exported functions:

- **`createNowPaymentsInvoice`** — Same validation as `createPayPalOrder` (ownership check, pending status check, expiry check). Converts currency to USD if needed. Calls service to create invoice. Returns `{ invoiceUrl, invoiceId }`.

- **`handleNowPaymentsWebhook`** — Verifies IPN signature. Parses payment status. Maps to internal status (see Section 5). Creates Payment record on `finished`. Triggers `placeExternalOrderIfEligible()` on success. Always returns 200.

### Step 4: Routes & Middleware

**`backend/routes/payment.routes.js`** — Add:
```javascript
router.post("/nowpayments/create-invoice", protect, createNowPaymentsInvoice);
router.post("/nowpayments/webhook", handleNowPaymentsWebhook);
```

**`backend/app.js`** — Add before `express.json()`:
```javascript
app.use('/api/payments/nowpayments/webhook', express.raw({ type: 'application/json' }));
```

Add CSRF exemption:
```javascript
if (req.method === 'POST' && req.path === '/api/payments/nowpayments/webhook') {
    return next();
}
```

### Step 5: Frontend API Client

**`frontend/src/config/api.ts`** — Add:
```typescript
payments: {
    // ... existing
    nowpaymentsCreateInvoice: "/api/payments/nowpayments/create-invoice",
}
```

**`frontend/src/services/payments/paymentsApi.client.ts`** — Add:
```typescript
async createNowPaymentsInvoice(orderId: string) {
    const { data } = await clientApi.post(
        endpoints.payments.nowpaymentsCreateInvoice,
        { orderId }
    );
    return data as { success: boolean; invoiceUrl: string; invoiceId: string };
}
```

### Step 6: Frontend — Payment Method Selector + Crypto Checkout

**Update `GameDetailsPage.tsx`** payment modal:
- Add state: `paymentMethod: "paypal" | "crypto"`
- Show two-tab selector: "PayPal" | "Pay with Crypto"
- Conditionally render `PayPalCheckout` or `NowPaymentsCheckout`

**Create `NowPaymentsCheckout.tsx`** (NEW):
- "Pay with Cryptocurrency" button
- On click: calls `createNowPaymentsInvoice(orderId)`
- Opens `invoiceUrl` in a new tab (NOWPayments hosted page)
- Shows "Waiting for payment confirmation..." message
- Info text about blockchain confirmation times
- User can close modal — order stays pending, webhook handles the rest

### Step 7: Verify Order Detail Page

Ensure order detail page (`/orders/:id`) displays correctly for NOWPayments orders:
- Shows "Crypto (NOWPayments)" as payment method
- Tracking timeline shows crypto-specific messages
- Pending orders with crypto method show appropriate messaging

### Step 8: Environment Variables

Add to `.env`:
```env
NOWPAYMENTS_API_KEY=<your-api-key>
NOWPAYMENTS_IPN_SECRET=<your-ipn-secret>
NOWPAYMENTS_API_URL=https://api.nowpayments.io/v1
```

---

## 7. Files Summary

| File | Status | Change |
|------|--------|--------|
| `backend/services/nowpayments.service.js` | **NEW** | NOWPayments API service (invoice, status, IPN verify) |
| `backend/models/payment.model.js` | MODIFY | Add `"nowpayments"` to `paymentGateway` enum |
| `backend/models/order.model.js` | MODIFY | Add `"nowpayments"` to `paymentMethod` enum |
| `backend/controllers/payment.controller.js` | MODIFY | Add `createNowPaymentsInvoice` + `handleNowPaymentsWebhook` |
| `backend/routes/payment.routes.js` | MODIFY | Add 2 new routes |
| `backend/app.js` | MODIFY | Raw body parser + CSRF exemption for webhook |
| `frontend/src/config/api.ts` | MODIFY | Add NOWPayments endpoint constant |
| `frontend/src/services/payments/paymentsApi.client.ts` | MODIFY | Add `createNowPaymentsInvoice` method |
| `frontend/src/components/user/gameDetails/GameDetailsPage.tsx` | MODIFY | Payment method selector in modal |
| `frontend/src/components/user/gameDetails/NowPaymentsCheckout.tsx` | **NEW** | Crypto checkout component |

---

## 8. Testing Plan

1. **Service layer**: Create an invoice with NOWPayments sandbox/test API keys, verify response shape
2. **Webhook**: Simulate IPN POST with valid HMAC signature → verify order updates to `paid`
3. **Webhook signature rejection**: Send invalid signature → verify 401 response
4. **Frontend flow**: Select crypto → verify invoice URL opens → verify waiting state
5. **Idempotency**: Send duplicate webhook → verify no duplicate Payment records
6. **Partial payment**: Simulate `partially_paid` IPN → verify order stays `pending`
7. **Expiry**: Verify existing 5-hour cron job expires NOWPayments pending orders correctly
8. **CSRF**: Verify webhook endpoint works without CSRF token
9. **Edge case**: Order already paid via PayPal → attempt crypto payment → verify rejection

---

## 9. NOWPayments Account Setup Checklist

- [ ] Create account at https://nowpayments.io
- [ ] Add payout wallet address
- [ ] Generate API key from dashboard
- [ ] Generate IPN secret key from Payment Settings
- [ ] Configure IPN callback URL: `https://yourdomain.com/api/payments/nowpayments/webhook`
- [ ] Whitelist NOWPayments IPs in firewall (request from partners@nowpayments.io)
- [ ] Test with sandbox mode before going live
