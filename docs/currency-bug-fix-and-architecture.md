# 🔴 Critical Bug Report: Payment Price Manipulation via Currency Exploitation

> **Severity**: Critical (P0)  
> **Status**: ⚠️ PARTIALLY FIXED — Requires architectural rework  
> **Discovered**: June 3, 2026  
> **Affected**: Production — real financial loss confirmed  
> **Component**: Order creation → Payment flow (backend + frontend)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [The Vulnerability](#the-vulnerability)
3. [Attack Scenarios](#attack-scenarios)
4. [Affected Files](#affected-files)
5. [Current State of the Fix](#current-state-of-the-fix)
6. [What Still Needs to Be Done](#what-still-needs-to-be-done)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [Appendix: Full Code References](#appendix-full-code-references)

---

## Executive Summary

A critical vulnerability in the order creation flow allowed malicious users to manipulate the price of game products by exploiting the **client-controlled `displayCurrency` parameter**. The backend blindly trusted the `displayCurrency` value sent from the frontend, used it to **convert the order amount**, and then **stored the converted (manipulated) amount as the canonical order price**.

**Real-world impact**: A $9 product was successfully purchased for **$0.15** (₹15 INR converted to USD). This affected both PayPal and UPI payment flows.

---

## The Vulnerability

### Root Cause

The `createOrder` function in `order.controller.js` accepts two currency-related parameters from the client:

```
POST /api/orders
{
    "currency": "USD",          ← selects which regionPricing to use
    "displayCurrency": "INR"    ← user's display currency (for localization)
}
```

**The problem**: The backend uses `displayCurrency` to convert the product price and then **overwrites** the order's stored `amount` and `currency` with the converted values. Since `displayCurrency` is fully client-controlled (set via localStorage/timezone detection), an attacker can manipulate it to create orders with absurdly low amounts.

### Vulnerable Code (`order.controller.js` lines 118-148)

```javascript
// Line 119: nativeCurrency comes from the client-sent "currency" field
const nativeCurrency = currency || "USD";
let finalCurrency = nativeCurrency;
let finalUnitPrice = unitPrice;
let finalAmount = amount;

// Lines 125-148: displayCurrency OVERWRITES the stored price
if (displayCurrency && displayCurrency !== nativeCurrency) {
    const rates = await getExchangeRates();
    finalUnitPrice = convertAmount(unitPrice, nativeCurrency, displayCurrency, rates);  // ⚠️
    finalAmount = convertAmount(amount, nativeCurrency, displayCurrency, rates);          // ⚠️
    finalCurrency = displayCurrency;                                                     // ⚠️
    // ...
}

// Lines 157-165: The CONVERTED (manipulated) values are stored
order = await Order.create({
    amount: finalAmount,         // ⚠️ CLIENT-INFLUENCED
    unitPrice: finalUnitPrice,   // ⚠️ CLIENT-INFLUENCED
    currency: finalCurrency,     // ⚠️ CLIENT-CONTROLLED
});
```

### Secondary Vulnerability (`currencyConverter.js` lines 41-42)

```javascript
const fromRate = rates[fromCurrency] || 1;  // Unknown currencies silently fall back to 1
const toRate = rates[toCurrency] || 1;      // Enables fabricated currency code exploits
```

Unknown or fabricated currency codes (e.g., `"XYZ"`) silently fall back to a rate of `1`, which can lead to incorrect conversions without any error or warning.

### Weak Validation (`order.model.js` line 34)

```javascript
amount: {
    type: Number,
    required: true,
    min: 0,   // ⚠️ Allows $0.00+ orders — no minimum order amount enforced
},
```

---

## Attack Scenarios

### Scenario 1: Currency Inversion Attack (The $0.15 exploit)

This is the exact attack observed in production.

**Setup**: Product has `regionPricing` with entry `{ region: "india", currency: "INR", price: 15 }`

**Attack steps**:
1. Attacker selects the variant whose regionPricing is in INR (₹15)
2. Frontend sends: `currency: "INR"`, `displayCurrency: "USD"`
3. Backend picks the INR pricing: `unitPrice = 15`
4. Backend detects `displayCurrency ("USD") !== nativeCurrency ("INR")`
5. Backend converts: `convertAmount(15, "INR", "USD", rates)` = `15 / 96 = $0.156`
6. Order is stored with `amount: 0.16, currency: "USD"`
7. When UPI initiates: `convertAmount(0.16, "USD", "INR")` = `₹15.36`

**Result**: Product worth $9 (or ₹864) is purchased for $0.16 (₹15).

```
┌──────────────────────────────────────────────────────────────────┐
│                    THE $0.15 ATTACK FLOW                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Product: "100 Diamonds" — Admin set price ₹15 (India region)    │
│  Same product: $9 (Global region)                                │
│                                                                  │
│  ① Attacker selects India region → gets ₹15 pricing              │
│  ② Intercepts API request, sets displayCurrency = "USD"          │
│  ③ Backend: convertAmount(15, "INR", "USD") = 15/96 = $0.156     │
│  ④ Order stored: amount=$0.16, currency="USD"                    │
│  ⑤ PayPal charges $0.16 — DONE. Product delivered.               │
│                                                                  │
│  💸 LOSS: $9.00 - $0.16 = $8.84 per order                       │
└──────────────────────────────────────────────────────────────────┘
```

### Scenario 2: Fabricated Currency Code

**Attack**: Send `displayCurrency = "XYZ"` (non-existent currency)

```javascript
convertAmount(9, "USD", "XYZ", rates)
// fromRate = rates["USD"] = 1
// toRate = rates["XYZ"] || 1 = 1  (silent fallback!)
// Result: 9 / 1 * 1 = 9 stored as "XYZ"
```

When UPI initiates: `convertAmount(9, "XYZ", "INR")` → `9 / 1 * 96 = ₹864` — this particular case doesn't cause a loss, but the silent fallback is dangerous as rates change.

### Scenario 3: Reverse Currency Swap

**Attack**: A product priced at $9 USD. Attacker sends `currency: "USD"`, `displayCurrency: "IDR"`.

```
convertAmount(9, "USD", "IDR", rates) = 9 * 15500 = 139,500 IDR stored
```

This creates an order for 139,500 IDR (~$9). No direct loss, but demonstrates the backend storing converted amounts that downstream payment processors must re-convert — creating precision errors and potential rounding exploits at scale.

---

## Affected Files

### Backend (Critical)

| File | Lines | Issue | Severity |
|------|-------|-------|----------|
| `controllers/order.controller.js` | 39, 118-148, 157-165 | `displayCurrency` accepted from client and used to convert/store order amount | 🔴 Critical |
| `utils/currencyConverter.js` | 41-42 | Unknown currencies silently fallback to rate=1 | 🔴 Critical |
| `models/order.model.js` | 31-35 | `amount: { min: 0 }` — no minimum order amount | 🟡 Medium |
| `controllers/payment.controller.js` | 104-110 | PayPal reads `order.amount` + `order.currency` — if manipulated at creation time, PayPal charges less | 🟡 Medium |
| `controllers/paymentSettings.controller.js` | 188-190 | UPI reads `order.amount` + `order.currency` — same issue | 🟡 Medium |

### Frontend (Contributing)

| File | Lines | Issue | Severity |
|------|-------|-------|----------|
| `components/user/gameDetails/GameDetailsPage.tsx` | 229-236 | Sends both `currency` (from regionPricing) and `displayCurrency` (from context) to `POST /api/orders` | 🟡 Medium |
| `context/CurrencyContext.tsx` | 27-60, 62-77 | `displayCurrency` is set from timezone or localStorage — fully user-controlled | ℹ️ Info |
| `services/orders/ordersApi.client.ts` | 20-23 | Passes raw payload including `displayCurrency` to backend | ℹ️ Info |

---

## Current State of the Fix

> ⚠️ **Important**: A fix was implemented in conversation `61d4122b` (June 3, 2026) but appears to have been **reverted or overwritten** by subsequent changes. The vulnerable code is **still present in the codebase**.

### What Was Fixed Previously (Now Reverted)

1. **Server-Side Price Authority**: Order amount was changed to always use the DB-native price. `displayCurrency` was only stored in `productSnapshot` as metadata.
2. **Currency Validation**: `currencyConverter.js` was updated to throw errors on unknown currencies instead of silently falling back to `rate=1`.
3. **Minimum Order Amount**: Server-side USD-equivalent check was added to reject orders below $0.01.

### What Is Currently Vulnerable (Present State)

The current code (`order.controller.js` lines 118-148) **still converts and stores** the order amount using the client-sent `displayCurrency`:

```javascript
// STILL VULNERABLE (current code):
if (displayCurrency && displayCurrency !== nativeCurrency) {
    finalUnitPrice = convertAmount(unitPrice, nativeCurrency, displayCurrency, rates);
    finalAmount = convertAmount(amount, nativeCurrency, displayCurrency, rates);
    finalCurrency = displayCurrency;   // ← stored as order's currency
}

order = await Order.create({
    amount: finalAmount,       // ← converted (manipulable) value
    currency: finalCurrency,   // ← client-controlled value
});
```

The `currencyConverter.js` **still has** the silent fallback:

```javascript
// STILL VULNERABLE (current code):
const fromRate = rates[fromCurrency] || 1;
const toRate = rates[toCurrency] || 1;
```

---

## What Still Needs to Be Done

### Phase 1: Immediate Security Fix (Critical)

1. **Server-Side Price Authority**  
   - The order's `amount`, `unitPrice`, and `currency` must ALWAYS come from the database (regionPricing)
   - `displayCurrency` should NEVER modify the stored amount
   - `displayCurrency` may be stored in `productSnapshot` for display purposes only

2. **Currency Validation**  
   - `convertAmount()` must throw on unknown currency codes instead of falling back to `rate=1`
   - Add an `ALLOWED_CURRENCIES` set validated against DB entries

3. **Minimum Order Enforcement**  
   - Add a USD-equivalent minimum (e.g., $0.50) to reject suspicious orders
   - Add model-level validation: `min: 0.01` on `amount` field

4. **Server-Side Price Verification**  
   - When `currency` is sent from the client, the backend should verify it matches an actual `regionPricing.currency` in the database
   - Reject orders where the client-sent `currency` doesn't match any regionPricing entry

### Phase 2: Architectural Currency Rework

5. **Canonical Price Storage**  
   - Orders should always store the price in the product's **native currency** (the currency from `regionPricing`)
   - Payment gateways (PayPal, UPI, NowPayments) should convert from the stored native currency at payment time
   - This eliminates the need for `displayCurrency` in the order creation flow entirely

6. **Remove `displayCurrency` from Order Creation API**  
   - Frontend should stop sending `displayCurrency` in the `POST /api/orders` payload
   - Display-only currency conversion should happen purely on the frontend
   - The backend API should only accept `currency` (the regionPricing currency) and validate it

7. **Audit Trail**  
   - Log all currency conversions with source/target rates for forensic analysis
   - Flag orders where the stored amount differs significantly from the product's DB price

---

## Data Flow Diagrams

### Current (Vulnerable) Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CURRENT ORDER CREATION FLOW                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FRONTEND                              BACKEND                          │
│  ────────                              ───────                          │
│                                                                         │
│  User selects variant                                                   │
│       ↓                                                                 │
│  selectedPricing = {                                                    │
│    region: "india",                                                     │
│    currency: "INR",  ──────┐                                            │
│    price: 15               │                                            │
│  }                         │                                            │
│       ↓                    │                                            │
│  displayCurrency = "USD"   │   POST /api/orders                         │
│  (from CurrencyContext) ───┼──→ { currency: "INR",                      │
│                            │      displayCurrency: "USD" }              │
│                            │           ↓                                │
│                            │   pricing = regionPricing.find(INR)        │
│                            │   unitPrice = 15 (from DB ✅)              │
│                            │           ↓                                │
│                            │   displayCurrency !== nativeCurrency?      │
│                            │   YES → convertAmount(15, INR, USD)        │
│                            │       = 15 / 96 = $0.156  ⚠️              │
│                            │           ↓                                │
│                            │   Order.create({                           │
│                            │     amount: 0.16,      ← MANIPULATED ⚠️   │
│                            │     currency: "USD"    ← CLIENT VALUE ⚠️   │
│                            │   })                                       │
│                            │           ↓                                │
│                            │   PayPal/UPI charges $0.16                 │
│                            │                                            │
│                            │   💸 Product worth $9, charged $0.16       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Target (Fixed) Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       TARGET ORDER CREATION FLOW                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FRONTEND                              BACKEND                          │
│  ────────                              ───────                          │
│                                                                         │
│  User selects variant                                                   │
│       ↓                                                                 │
│  selectedPricing = {                                                    │
│    region: "india",                                                     │
│    currency: "INR",  ──────┐                                            │
│    price: 900              │   (correct INR price for $9 product)       │
│  }                         │                                            │
│       ↓                    │                                            │
│  displayCurrency = "USD"   │   POST /api/orders                         │
│  (kept on frontend only) ──┼──→ { currency: "INR" }                     │
│                            │   (NO displayCurrency sent)                │
│                            │           ↓                                │
│                            │   pricing = regionPricing.find(INR)        │
│                            │   unitPrice = 900 (from DB ✅)             │
│                            │           ↓                                │
│                            │   VALIDATE: currency matches DB?  ✅       │
│                            │   VALIDATE: amount >= min threshold?  ✅   │
│                            │           ↓                                │
│                            │   Order.create({                           │
│                            │     amount: 900,        ← FROM DB ✅       │
│                            │     currency: "INR"     ← FROM DB ✅       │
│                            │   })                                       │
│                            │           ↓                                │
│                            │   PayPal: convertAmount(900, INR, USD)     │
│                            │         = $9.38 → charges $9.38  ✅        │
│                            │   UPI: charges ₹900 directly  ✅           │
│                            │                                            │
│                            │   ✅ Correct price charged                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix: Full Code References

### Key Files to Modify

| File | Purpose |
|------|---------|
| [`order.controller.js`](../backend/controllers/order.controller.js) | Order creation — remove `displayCurrency` influence on stored amount |
| [`currencyConverter.js`](../backend/utils/currencyConverter.js) | Currency conversion — add validation, reject unknowns |
| [`order.model.js`](../backend/models/order.model.js) | Order schema — increase minimum amount |
| [`payment.controller.js`](../backend/controllers/payment.controller.js) | PayPal flow — reads stored order amount |
| [`paymentSettings.controller.js`](../backend/controllers/paymentSettings.controller.js) | UPI flow — reads stored order amount |
| [`GameDetailsPage.tsx`](../frontend/src/components/user/gameDetails/GameDetailsPage.tsx) | Frontend order creation — stop sending `displayCurrency` |
| [`CurrencyContext.tsx`](../frontend/src/context/CurrencyContext.tsx) | Display currency management — keep for UI only |
| [`ordersApi.client.ts`](../frontend/src/services/orders/ordersApi.client.ts) | API client — update `CreateOrderPayload` type |

### Exchange Rate Configuration

Current exchange rates (hardcoded fallbacks + DB overrides):

| Currency | Rate (per 1 USD) | Source |
|----------|-------------------|--------|
| USD | 1 | Hardcoded |
| INR | 96 | Fallback (DB overridable) |
| PHP | 56 | Fallback (DB overridable) |
| BRL | 5 | Fallback (DB overridable) |
| IDR | 15,500 | Fallback (DB overridable) |

### Payment Gateway Currency Requirements

| Gateway | Required Currency | Conversion Point |
|---------|-------------------|-------------------|
| PayPal | USD | `payment.controller.js` line 104-110 |
| UPI | INR | `paymentSettings.controller.js` line 188-190 |
| NOWPayments (Crypto) | USD | `payment.controller.js` line 349-354 |

---

*Last updated: June 7, 2026*
