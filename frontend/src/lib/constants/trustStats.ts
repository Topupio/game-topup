/**
 * Social-proof figures shown on the order page.
 *
 * TODO: These are placeholders, not measured values — there is no public stats endpoint
 * yet. `ordersDelivered` and `avgDelivery` need one (admin `/api/dashboard` is the only
 * aggregate source today and it is auth-gated). `rating` / `reviewCount` could come from
 * the existing per-game review summary: GET /api/reviews/games/:gameId already returns
 * { averageRating, totalReviews }.
 *
 * Keep them here rather than inline so there is one place to swap when those land.
 */
export const TRUST_STATS = [
    { value: "12,400+", label: "Orders delivered" },
    { value: "~2 min", label: "Avg delivery" },
    { value: "4.8★", label: "1,900+ reviews" },
];
