# Game Review After Completed Order Plan

## Goal

Allow a logged-in customer to review a game only after they have actually purchased through this platform and the related order is both paid and completed.

The review is game-level, not variant-level. If a customer completes multiple separate orders, they can submit multiple reviews, one per completed order.

## Current Repo Context

The backend already has the two status fields needed for the access gate:

- `paymentStatus` on `Order`, with values like `pending`, `paid`, `failed`, `refunded`.
- `orderStatus` on `Order`, with values like `pending`, `paid`, `processing`, `completed`, `cancelled`, `failed`, `expired`.

The existing order tracking surfaces are:

- `backend/models/order.model.js`
- `backend/controllers/order.controller.js`
- `backend/routes/order.routes.js`
- `frontend/src/services/orders/ordersApi.client.ts`
- `frontend/src/services/orders/types.ts`
- `frontend/src/components/user/account/AccountOrdersList.tsx`
- `frontend/src/components/user/orders/UserOrderDetailClient.tsx`
- Home landing page route: `frontend/src/app/(user)/page.tsx`

## Eligibility Rule

A user can submit a review only when all conditions are true:

1. The user is logged in.
2. The order belongs to that user.
3. `order.paymentStatus === "paid"`.
4. `order.orderStatus === "completed"`.
5. No review exists for that specific order.

Important: this rule must be enforced on the backend. The frontend popup is only a convenience prompt, not the source of permission.

## Multiple Order Rule

Users can review the same game multiple times only when they have multiple separate completed paid orders.

Implementation rule:

- Unique per `order`.
- Not unique per `user + game`.

This means:

- Order A for Mobile Legends completed: user can review.
- Order B for Mobile Legends completed later: user can review again.
- Same Order A cannot create a second review.

## Backend Plan

### 1. Add `GameReview` model

Create:

`backend/models/gameReview.model.js`

Fields:

- `user`: ObjectId ref `User`, required, indexed.
- `game`: ObjectId ref `Game`, required, indexed.
- `order`: ObjectId ref `Order`, required, unique.
- `rating`: Number, required, min `1`, max `5`.
- `comment`: String, optional, trimmed, max length around `1000`.
- timestamps.

Indexes:

- `{ order: 1 }` unique.
- `{ game: 1, createdAt: -1 }`.
- `{ user: 1, createdAt: -1 }`.

No variant/product field is needed because this review belongs to the game.

### 2. Add review controller methods

Add to `backend/controllers/order.controller.js` or a small `review.controller.js`.

To avoid overengineering, keep it in `order.controller.js` unless the file becomes messy.

#### `getRecentReviewEligibleOrder`

Route:

`GET /api/orders/review-eligible/recent`

Access:

Private user.

Behavior:

1. Read current `req.user.id`.
2. Find the user's latest orders where:
   - `paymentStatus: "paid"`
   - `orderStatus: "completed"`
3. Exclude orders that already have a review.
4. Return the newest eligible order with populated game info.

Response when eligible:

```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "...",
      "orderId": "ORD-...",
      "game": {
        "_id": "...",
        "name": "...",
        "imageUrl": "..."
      },
      "productSnapshot": {
        "name": "..."
      },
      "completedAt": "..."
    }
  }
}
```

Response when not eligible:

```json
{
  "success": true,
  "data": null
}
```

Notes:

- This endpoint should be cheap. Limit checked orders to a small number, for example latest 10 completed paid orders, then filter reviewed orders.
- This is enough for the popup. We do not need a full review inbox now.

#### `submitOrderReview`

Route:

`POST /api/orders/:id/review`

Access:

Private user.

Payload:

```json
{
  "rating": 5,
  "comment": "Fast delivery"
}
```

Validation:

- `rating` must be an integer or number between `1` and `5`.
- `comment` optional but trim it.
- Reject comments over max length.

Backend checks:

1. Find order by `_id` and `user: req.user.id`.
2. Reject if not found.
3. Reject unless `paymentStatus === "paid"` and `orderStatus === "completed"`.
4. Reject if a review already exists for that `order`.
5. Create review with:
   - `user: req.user.id`
   - `order: order._id`
   - `game: order.game`
   - `rating`
   - `comment`

Recommended status codes:

- `400`: invalid rating/comment.
- `403`: order exists but is not eligible to review.
- `404`: order not found for this user.
- `409`: review already exists for this order.

### 3. Wire routes

Update:

`backend/routes/order.routes.js`

Add private user routes:

```js
router.get("/review-eligible/recent", protect, getRecentReviewEligibleOrder);
router.post("/:id/review", protect, submitOrderReview);
```

Place them with the user routes before admin routes. The `POST /:id/review` route is order-specific and keeps the authorization check obvious.

### 4. Optional review display endpoint

Not required for this first implementation.

If later needed, add:

`GET /api/games/:id/reviews`

That endpoint can show game-level reviews on the game detail page. For this task, the main goal is collecting valid reviews after real completed purchases.

## Frontend Plan

### 1. Add order review API methods

Update:

`frontend/src/services/orders/ordersApi.client.ts`

Add:

- `getRecentReviewEligibleOrder()`
- `submitOrderReview(orderId, payload)`

Update:

`frontend/src/services/orders/types.ts`

Add types:

- `ReviewEligibleOrderResponse`
- `SubmitOrderReviewPayload`
- `GameReview`

Keep the type small and aligned to what the modal needs.

### 2. Add homepage prompt component

Create:

`frontend/src/components/user/reviews/ReviewPromptModal.tsx`

Responsibilities:

1. Call `getRecentReviewEligibleOrder()` only after auth loading is finished and a user exists.
2. If the API returns no eligible order, render nothing.
3. If it returns an eligible order, show a graceful modal:
   - "Want to review your recent purchase?"
   - Game name.
   - Purchased item name from `productSnapshot.name`.
   - Buttons: `Not now`, `Write review`.
4. If user clicks `Write review`, show:
   - 1-5 star selector.
   - Comment textarea.
   - Submit button.
5. On submit, call `submitOrderReview(order._id, { rating, comment })`.
6. On success, close modal and show success toast.

Do not show this to logged-out users.

### 3. Mount prompt on home landing page

Because the user may leave after placing an order and return later, the best place is the home landing page.

Current route:

`frontend/src/app/(user)/page.tsx`

That page is a server component. Add a small client wrapper component, for example:

`frontend/src/components/user/reviews/HomeReviewPrompt.tsx`

Then render it inside the homepage JSX:

```tsx
<HomeReviewPrompt />
```

`HomeReviewPrompt` can use `useAuth()` and call the client API.

This keeps the server homepage data loading unchanged.

### 4. Dismiss behavior

Use `localStorage` only for popup convenience:

Key:

`review_prompt_dismissed_${orderId}`

Rules:

- If user clicks `Not now`, store the key and do not show that order prompt again in this browser.
- If another eligible order appears later, it can still show.
- If localStorage is cleared, the popup may show again, but backend still prevents duplicate review submission.

This avoids adding a separate backend "dismissed prompt" table for now.

### 5. Optional account/order detail button

Optional but useful:

- In `AccountOrdersList.tsx`, show a small `Review` button for completed paid orders that are not reviewed, if backend starts returning a review flag.
- In `UserOrderDetailClient.tsx`, show a review box when the current order is eligible.

Not required for the first pass if the homepage popup is the chosen UX.

## UX Copy

Prompt title:

`Want to review your recent purchase?`

Prompt body:

`Your order for {gameName} is complete. Share how the delivery went.`

Primary action:

`Write review`

Secondary action:

`Not now`

Submit action:

`Submit review`

Success toast:

`Thanks for your review.`

Eligibility failure message if backend rejects after stale UI:

`This order is not ready for review yet.`

## Why Home Page Prompt Makes Sense

Order completion may happen after payment verification or fulfillment status updates. The customer may not still be on the order detail page when both checks become true.

Showing the popup on the landing page catches this natural flow:

1. Customer places order.
2. Payment and delivery complete later.
3. Customer returns to the site.
4. Homepage checks for latest eligible completed paid order.
5. Customer is invited to review.

This is better than only showing the review prompt immediately after checkout, because the order usually will not be completed at that moment.

## Non-Goals For First Pass

Do not add these in the first implementation unless explicitly requested:

- Admin review moderation dashboard.
- Average rating recalculation on every game.
- Review photos/videos.
- Variant-level reviews.
- One-review-per-game restriction.
- Email review reminders.
- Push notifications.
- Review prompt dismissal stored in database.
- Public review listing on game page.

## Implementation Order

1. Add `GameReview` model.
2. Add backend eligible-order endpoint.
3. Add backend submit-review endpoint.
4. Add routes.
5. Add frontend API/types.
6. Add homepage client prompt component.
7. Mount prompt in `frontend/src/app/(user)/page.tsx`.
8. Verify with manual cases:
   - unpaid order: no prompt, API submit rejects.
   - paid but not completed: no prompt, API submit rejects.
   - completed but not paid: no prompt, API submit rejects.
   - paid + completed: prompt appears, submit succeeds.
   - same order after review: no prompt, API submit returns conflict.
   - second completed order for same game: prompt appears again.

## Testing Notes

Backend:

- Use existing auth-protected order routes.
- Seed or update an order to `paymentStatus: "paid"` and `orderStatus: "completed"`.
- Confirm the review creates a document with `game: order.game`.
- Confirm duplicate submit for same order is blocked.

Frontend:

- Login as a user with an eligible order.
- Visit `/`.
- Confirm the prompt appears after auth loads.
- Click `Not now`, refresh, confirm it does not show for the same order.
- Clear localStorage or use a second eligible order, confirm prompt appears.
- Submit rating/comment and confirm modal closes.

