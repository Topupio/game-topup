# PayPal Payment Gateway Integration Plan

> Researched via Context7 MCP: `@paypal/paypal-typescript-server-sdk` (522 snippets, High reputation), `@paypal/paypal-checkout-components` (56 snippets, High reputation)

## Context

The game top-up platform currently creates orders with "pending" status but has **no payment gateway integrated** - admins manually verify payments. We need to integrate PayPal so users can pay directly at checkout.

**Tech Stack**: Next.js 16 + React 19 (frontend), Express.js 5 + MongoDB/Mongoose (backend)

---

## Architecture: PayPal Orders v2 + Smart Payment Buttons

**Server-side order creation** (best practice per PayPal docs - keeps amount on server, prevents tampering):

```
User selects variant → fills form → clicks "Proceed"
  → POST /api/orders (creates order, status: pending)
  → Show PayPal Smart Buttons (modal overlay)
  → User clicks PayPal button
  → Frontend calls POST /api/payments/paypal/create-order
      → Backend creates PayPal order via Orders v2 API (server-side, amount from DB)
      → Returns paypalOrderId to frontend
  → User completes payment in PayPal popup
  → Frontend calls POST /api/payments/paypal/capture-order
      → Backend captures via Orders v2 API, updates order to "paid"
  → Redirect to /orders/{id} with success
  → Webhook (safety net) confirms payment if capture response was lost
```

---

## Step 1: Install Dependencies

**Backend** - Use the official PayPal TypeScript Server SDK:
```bash
cd backend && npm install @paypal/paypal-server-sdk
```

Per Context7 docs, the SDK provides `OrdersController` and `PaymentsController` with typed methods for `createOrder`, `captureOrder`, and `refundCapturedPayment`. Client initialization:

```ts
import { Client, Environment, LogLevel, OrdersController, PaymentsController } from '@paypal/paypal-server-sdk';

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET
  },
  timeout: 0,
  environment: process.env.PAYPAL_MODE === 'live' ? Environment.Production : Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true }
  },
});
```

**Frontend**:
```bash
cd frontend && npm install @paypal/react-paypal-js
```

---

## Step 2: Environment Variables

**Backend `.env`**:
```
PAYPAL_CLIENT_ID=<from developer.paypal.com>
PAYPAL_CLIENT_SECRET=<from developer.paypal.com>
PAYPAL_MODE=sandbox          # "sandbox" or "live"
PAYPAL_WEBHOOK_ID=<webhook ID from PayPal dashboard>
```

**Frontend `.env.local`**:
```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<same client ID>
```

---

## Step 3: Backend Model Updates

### 3a. `/backend/models/order.model.js` (line 57)
- Add `"paypal"` to `paymentMethod` enum: `["razorpay", "stripe", "wallet", "binancePay", "paypal"]`
- Add `currency` field (String, default "USD") at top level for multi-currency support

### 3b. `/backend/models/payment.model.js` (line 21)
- Add `"paypal"` to `paymentGateway` enum: `["razorpay", "stripe", "wallet", "binancePay", "paypal"]`

---

## Step 4: New Backend Service - PayPal API Client

### New file: `/backend/services/paypal.service.js`

Uses the official `@paypal/paypal-server-sdk` which handles OAuth token management automatically.

**Key methods to implement:**

| Method | SDK Controller Method | Purpose |
|--------|----------------------|---------|
| `createOrder(amount, currency, referenceId)` | `ordersController.createOrder()` | Creates order with `intent: CAPTURE` and `purchase_units` |
| `captureOrder(paypalOrderId)` | `ordersController.captureOrder()` | Captures payment, returns capture ID + status |
| `refundCapture(captureId, amount?, currency?)` | `paymentsController.refundCapturedPayment()` | Full refund (empty body) or partial (with amount) |
| `verifyWebhookSignature(headers, body)` | Raw fetch to `/v1/notifications/verify-webhook-signature` | Webhook verification (not in SDK) |

**Create Order** (per Context7 SDK docs):
```js
const { result } = await ordersController.createOrder({
  body: {
    intent: 'CAPTURE',
    purchaseUnits: [{
      referenceId: order.orderId,        // our internal order ID
      amount: {
        currencyCode: currency,           // 'USD', 'INR', etc.
        value: amount.toFixed(2),         // string format required
      },
    }],
  },
  prefer: 'return=minimal',
});
// result.id → PayPal order ID to return to frontend
```

**Capture Order** (per Context7 SDK docs):
```js
const { result } = await ordersController.captureOrder({
  id: paypalOrderId,
  prefer: 'return=representation',  // get full response with capture details
});
// result.status → 'COMPLETED'
// result.purchaseUnits[0].payments.captures[0].id → capture ID for refunds
```

**Refund** (per Context7 SDK docs):
```js
const { result } = await paymentsController.refundCapturedPayment({
  captureId: captureId,
  body: amount ? {
    amount: { currencyCode: currency, value: amount.toFixed(2) }
  } : {},  // empty body = full refund
});
```

**Error handling** (per SDK docs): Catch `ApiError` instances which contain typed error results:
```js
try { ... } catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;  // typed error details
  }
}
```
Key error codes: 400 (malformed), 401 (auth), 422 (business validation/INSTRUMENT_DECLINED).

---

## Step 5: New Backend Controller & Routes

### New file: `/backend/controllers/payment.controller.js`

**`createPayPalOrder`** - `POST /api/payments/paypal/create-order` (auth required)
- Accepts `{ orderId }` (MongoDB `_id`)
- Validates: order exists, belongs to `req.user`, `paymentStatus === "pending"`
- Calls `paypalService.createOrder(order.amount, order.currency || "USD", order.orderId)`
- Stores PayPal order ID in `order.paymentInfo.transactionId`
- Returns `{ paypalOrderId }` to frontend

**`capturePayPalOrder`** - `POST /api/payments/paypal/capture-order` (auth required)
- Accepts `{ paypalOrderId, orderId }`
- Calls `paypalService.captureOrder(paypalOrderId)`
- **On COMPLETED**: Updates order (`paymentStatus: "paid"`, `orderStatus: "paid"`, `paymentMethod: "paypal"`), stores capture ID + full response, adds tracking entry, creates Payment document
- **On INSTRUMENT_DECLINED** (per PayPal best practice): Return error so frontend can restart payment with different funding source
- **On other failure**: Updates to `"failed"`, creates Payment with `status: "failed"`
- Idempotent: checks if already paid before processing

**`handlePayPalWebhook`** - `POST /api/payments/paypal/webhook` (NO auth, NO CSRF)
- Verifies signature via `paypalService.verifyWebhookSignature()`
- Handles: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`
- Safety net - updates order only if not already in final state
- Returns 200 immediately (PayPal retries on non-2xx)

**`refundPayPalPayment`** - `POST /api/payments/paypal/refund` (admin only)
- Accepts `{ orderId, amount?, reason }`
- Finds Payment record → gets capture ID → calls `paypalService.refundCapture()`
- Per SDK: empty body = full refund, amount object = partial refund
- Updates Payment refund fields + Order status → logs admin activity

### New file: `/backend/routes/payment.routes.js`
```
POST /api/payments/paypal/create-order   → protect → createPayPalOrder
POST /api/payments/paypal/capture-order  → protect → capturePayPalOrder
POST /api/payments/paypal/webhook        → raw body → handlePayPalWebhook
POST /api/payments/paypal/refund         → protect → authorize("admin") → refundPayPalPayment
```

---

## Step 6: Backend `app.js` Changes

File: `/backend/app.js`

Four changes needed:

1. **Import payment router** (after line 16):
   ```js
   import paymentRouter from './routes/payment.routes.js';
   ```

2. **Raw body parser for webhook** - Add BEFORE `express.json()` (before line 48):
   ```js
   app.use('/api/payments/paypal/webhook', express.raw({ type: 'application/json' }));
   ```

3. **CSRF exemption for webhook** - Modify CSRF middleware (line 64-72) to skip `/api/payments/paypal/webhook`:
   ```js
   if (req.method === 'POST' && req.path === '/api/payments/paypal/webhook') {
       return next();
   }
   ```

4. **Mount payment router** (after line 83):
   ```js
   app.use('/api/payments', paymentRouter);
   ```

---

## Step 7: Update Order Controller

File: `/backend/controllers/order.controller.js`

- Accept `currency` from frontend request body (derived from selected region pricing)
- Store `currency` on the order for PayPal to use the correct currency
- Accept optional `paymentMethod` (default to `"paypal"`)

---

## Step 8: Frontend - PayPal Provider

### New file: `/frontend/src/components/providers/PayPalProvider.tsx`

```tsx
"use client";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function PayPalProvider({ children }: { children: React.ReactNode }) {
    return (
        <PayPalScriptProvider
            options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                currency: "USD",
                intent: "capture",
            }}
        >
            {children}
        </PayPalScriptProvider>
    );
}
```

Add this provider in the `(user)` layout so it's available on game detail and order pages.

---

## Step 9: Frontend - Payment API Client

### New file: `/frontend/src/services/payments/paymentsApi.client.ts`

```ts
import { clientApi } from "@/lib/http/index";
import { endpoints } from "@/config/api";

export const paymentsApiClient = {
    async createPayPalOrder(orderId: string) {
        const { data } = await clientApi.post(endpoints.payments.paypalCreateOrder, { orderId });
        return data;  // { success, paypalOrderId }
    },
    async capturePayPalOrder(paypalOrderId: string, orderId: string) {
        const { data } = await clientApi.post(endpoints.payments.paypalCaptureOrder, { paypalOrderId, orderId });
        return data;  // { success, data: updatedOrder }
    },
};
```

### Update: `/frontend/src/config/api.ts`
Add `payments` section to endpoints object:
```ts
payments: {
    paypalCreateOrder: "/api/payments/paypal/create-order",
    paypalCaptureOrder: "/api/payments/paypal/capture-order",
},
```

---

## Step 10: Frontend - PayPal Checkout Component

### New file: `/frontend/src/components/user/gameDetails/PayPalCheckout.tsx`

Per Context7 PayPal Checkout Components docs, uses **server-side order creation pattern** (best practice):

```tsx
<PayPalButtons
    createOrder={async () => {
        // Call OUR server (not PayPal directly) - server creates order with amount from DB
        const res = await paymentsApiClient.createPayPalOrder(orderId);
        return res.paypalOrderId;  // Return PayPal order ID to SDK
    }}
    onApprove={async (data) => {
        // Call OUR server to capture - server captures via PayPal SDK
        const res = await paymentsApiClient.capturePayPalOrder(data.orderID, orderId);
        if (res.success) onSuccess();
    }}
    onError={(err) => {
        console.error('Payment error:', err);
        onError(err);
    }}
    onCancel={() => onCancel()}
    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
/>
```

Key difference from client-side pattern: `createOrder` calls our backend (which reads amount from DB), NOT `actions.order.create()`. This prevents frontend amount tampering.

Props: `orderId`, `amount` (display only), `currency`, `symbol`, `onSuccess`, `onError`, `onCancel`.

---

## Step 11: Frontend - Modify Checkout Flow

### File: `/frontend/src/components/user/gameDetails/GameDetailsPage.tsx`

Current flow (line 130-184): creates order → immediately redirects to order page.

**New flow**:
1. Add state: `pendingOrder` and `showPayment`
2. On `handleProceedToCheckout` success: set `pendingOrder` + `showPayment = true` (no redirect, no success toast yet)
3. Render a payment modal/overlay with `PayPalCheckout` component when `showPayment` is true
4. On PayPal success → toast("Payment successful!") + redirect to `/orders/{id}`
5. On cancel → dismiss modal, toast info ("Order saved, you can pay later from My Orders")
6. On error → dismiss modal, toast error

This approach keeps both desktop (`CheckoutCard`) and mobile (`MobileCheckoutSheet`) flows working without modifying those components individually.

---

## Step 12: Frontend - Order Detail Page (Pay Later)

### File: `/frontend/src/components/user/orders/UserOrderDetailClient.tsx`

Add a "Complete Payment" section when `order.paymentStatus === "pending"`:
- Render `PayPalCheckout` component with the order details
- On success → reload the page to show updated status
- This handles abandoned checkouts (user created order but didn't complete payment)

### File: `/frontend/src/components/user/orders/UserOrdersClient.tsx`

Add a "Pay Now" badge/button on orders with `paymentStatus === "pending"`, linking to the order detail page.

---

## Step 13: Admin Refund Integration

### File: Admin order management component

Add a "Refund via PayPal" button for orders with `paymentMethod === "paypal"` and `paymentStatus === "paid"`.

Per Context7 SDK docs, refund supports:
- **Full refund**: Empty request body → refunds entire captured amount
- **Partial refund**: Include `{ amount: { currencyCode, value } }` in body
- Optional `noteToPayer` field (max 255 chars) for payer notification

---

## Files Summary

| Action | File |
|--------|------|
| **Modify** | `/backend/models/order.model.js` - add "paypal" to enum, add currency field |
| **Modify** | `/backend/models/payment.model.js` - add "paypal" to enum |
| **Create** | `/backend/services/paypal.service.js` - PayPal SDK client wrapper |
| **Create** | `/backend/controllers/payment.controller.js` - 4 controller functions |
| **Create** | `/backend/routes/payment.routes.js` - payment routes |
| **Modify** | `/backend/app.js` - raw body parser, CSRF exemption, mount routes |
| **Modify** | `/backend/controllers/order.controller.js` - accept currency + paymentMethod |
| **Create** | `/frontend/src/components/providers/PayPalProvider.tsx` - PayPal SDK wrapper |
| **Create** | `/frontend/src/services/payments/paymentsApi.client.ts` - API client |
| **Modify** | `/frontend/src/config/api.ts` - add payment endpoints |
| **Create** | `/frontend/src/components/user/gameDetails/PayPalCheckout.tsx` - PayPal buttons |
| **Modify** | `/frontend/src/components/user/gameDetails/GameDetailsPage.tsx` - show PayPal after order |
| **Modify** | `/frontend/src/components/user/orders/UserOrderDetailClient.tsx` - pay later flow |
| **Modify** | `/frontend/src/components/user/orders/UserOrdersClient.tsx` - "Pay Now" badge |

---

## Security Considerations

- **Server-side amount** (PayPal best practice): `createPayPalOrder` reads amount from Order in DB, never from frontend request
- **Webhook signature verification**: Every webhook verified via PayPal's `verify-webhook-signature` API
- **CSRF exempt only for webhook** (verified by PayPal signature instead)
- **Order ownership**: All user endpoints verify `order.user === req.user.id`
- **Idempotency**: Capture + webhook handlers check if order already paid before updating
- **INSTRUMENT_DECLINED handling**: Per PayPal docs, if funding source fails, return error so frontend restarts payment flow for user to select different payment method
- **Rate limiting**: Apply `rateLimit` to payment endpoints (20 req/15min for user, higher for webhook)
- **Input validation**: Validate `orderId` as valid MongoDB ObjectId via express-validator

---

## PayPal Developer Dashboard Setup

1. Go to developer.paypal.com → create a REST API app
2. Get Client ID and Secret (sandbox first, then live)
3. Create a webhook pointing to `https://yourdomain.com/api/payments/paypal/webhook`
4. Subscribe to events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`
5. Note the Webhook ID for signature verification
6. Create sandbox buyer/seller test accounts for testing

---

## Testing Checklist

1. **Sandbox setup**: Configure PayPal sandbox credentials
2. **Happy path**: Select variant → proceed → pay via PayPal sandbox → verify order updates to "paid"
3. **Cancel flow**: Start PayPal payment → close popup → verify order stays "pending" → pay from order detail page
4. **INSTRUMENT_DECLINED**: Use sandbox test cards that decline → verify user can retry with different method
5. **Webhook test**: Use PayPal webhook simulator → verify order updates
6. **Refund test**: As admin, refund a paid order → verify PayPal refund + status update
7. **Double-pay prevention**: Try paying an already-paid order → should be rejected
8. **Cross-user test**: Try paying another user's order → should get 403
9. **Mobile flow**: Test entire flow on mobile (MobileCheckoutSheet → PayPal popup)
10. **Network resilience**: Capture succeeds at PayPal but client disconnects → webhook picks up payment
