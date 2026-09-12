---
name: admin-order-status-optimistic-save
description: Admin order-detail status dropdowns save optimistically on change; the Save button covers only note + delivery
metadata:
  type: project
---

On the admin order-detail page, the Order Status and Payment Status dropdowns are deliberately NOT part of the Save-button form. They PATCH their own single field immediately on change, revert local state and toast on error, and have no save button. `hasChanges` (which drives Save/Discard) covers only the admin note and delivery. `canRefund` therefore reads the **saved** `order.orderStatus` / `order.paymentStatus`, never the local `status` / `paymentStatus` variables.

**Why:** The backend rejects `"refunded"` on a plain update — that status is set only by the actual refund flow. Reading local unsaved state for `canRefund` previously let an admin open the refund modal against a status that was never persisted.

**How to apply:** When touching this page, never add `orderStatus` or `paymentStatus` to the `handleUpdate` payload or to `hasChanges`, and never point `canRefund` at the local state variables. The refund button stays always-rendered-but-disabled with an explanatory `title` tooltip rather than being conditionally hidden, so admins can see why it is unavailable.

Related: [[surgical-revert-via-head-baseline]]
