# Order Details — Design System

Scope: the customer-facing order detail page and everything it renders.

- `components/user/orders/topupOrder/**` — state-driven layout (uid / live apps / login top-ups)
- `components/user/orders/UserOrderDetailClient.tsx` — router + `GenericOrderDetail`
- `components/user/orders/AdminMessageCard.tsx`, `DeliveryCard.tsx`

This documents the system as it exists in the code. Follow it when adding to these
screens, and update it when the system genuinely changes. (Unlike `STYLE_GUIDE.md`,
which is a dated changelog of past diffs, this is a spec.)

---

## Tokens

Tailwind v4, defined in an `@theme` block in `src/app/globals.css`. **There is no
`tailwind.config`.**

| Token | Value | Use |
|---|---|---|
| `secondary` | `#6366F1` | Brand, actions, active state, links |
| `secondary-foreground` | `#4F46E5` | Deeper indigo for hover text |
| `success` | `#22C55E` | Delivered, confirmed, positive |
| `warning` | `#F59E0B` | Caution notes, payment pending |
| `danger` | `#EF4444` | Failed, destructive |
| `tertiary` | `#FBBF24` | Gold accent (sparingly) |
| `background` | `#F8FAFC` | Page ground |
| `card` | `#FFFFFF` | Card surface |
| `muted` | `#F1F5F9` | Inset panel, chip background |
| `muted-foreground` | `#64748B` | Secondary text, labels |
| `foreground` | `#0F172A` | Primary text |
| `border` | `#E2E8F0` | All hairlines |
| `shadow-soft` | `0 4px 14px rgba(0,0,0,.08)` | Every card |

**Rules**

- Never use raw palette classes (`text-gray-500`, `bg-green-500`, `bg-violet-100`) on a
  light surface. A token exists for each. Semantic status colours come from
  `success` / `warning` / `danger`, not from `green-*` / `amber-*` / `red-*`.
- **The app is light-mode only.** No `.dark` block, no `darkMode` config. Do not add
  `dark:` variants — they are dead code.
- **Exception — dark gradient heroes.** `hero/OrderHero.tsx` and `hero/DeliveredHero.tsx`
  sit on dark gradients where light-surface tokens are invisible. Raw palette classes
  (`text-slate-400`, `text-emerald-200`, `bg-white/10`) are correct *there and only there*.

---

## Page layout

Two columns on desktop, one on mobile. The sidebar is sticky and carries only
context — never anything the customer has to act on.

```
┌─────────────────────────────────────────────┬──────────────────┐
│  ← Back to My Account        [Order update] │                  │
├─────────────────────────────────────────────┤   Game card      │
│  HERO            (state colour, gradient)   │   (sticky)       │
│  STEPPER         (hidden when closed)       │                  │
│  ADMIN NOTE      (conditional)              │   Need help?     │
│  ▸ STATE CENTREPIECE                        │   Contact CTA    │
│  TRUST STRIP     (awaiting / verifying)     │                  │
│  DELIVERY CARD   (conditional)              │                  │
│  ACCOUNT DETAILS (hidden when delivered)    │                  │
│  TIMELINE                                   │                  │
└─────────────────────────────────────────────┴──────────────────┘
```

```tsx
<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
  <div className="space-y-3 sm:space-y-4">{/* main */}</div>
  <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">{/* context */}</aside>
</div>
```

Page frame: `px-3 pb-16 pt-22 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32`, inner
`mx-auto max-w-7xl`. The tall top padding clears the fixed navbar.

### Composition order

Fixed, top to bottom. Order matters: the customer should hit *what's happening* before
*what they submitted*.

| # | Section | Renders when |
|---|---|---|
| 1 | `DeliveredHero` / `OrderHero` | Always — delivered swaps in the green hero |
| 2 | `OrderStepper` | `steps !== null` — i.e. every state except `closed` |
| 3 | `AdminMessageCard` | Admin note has content |
| 4 | **State centrepiece** | One per state — see table below |
| 5 | `TrustStrip` | `awaiting_payment` or `verifying` only |
| 6 | `DeliveryCard` | `order.delivery?.kind` is set |
| 7 | `AccountDetails` | Not `delivered` |
| 8 | `OrderTimeline` | Always |

### Centrepiece per state

| State | Renders |
|---|---|
| `awaiting_payment` | `PaymentCard` |
| `verifying` | `VerifyingCard` + `PaymentAccordion` |
| `processing` | `LoginActionCard` if login flow, else `ProcessingCard` |
| `delivered` | `DeliveredSummary` |
| `closed` | `ClosedCard` |

**Why the conditionals exist**

- **Stepper hidden when `closed`** — a cancelled or refunded order has no progress to show.
- **Trust strip only before payment clears** — social proof helps someone deciding to pay
  or waiting on verification. On a delivered order it is noise.
- **Account details hidden when `delivered`** — `DeliveredSummary` already lists the same
  fields; showing both duplicates them.
- **Delivery card is unconditional on state** — `adminUpdateOrder` validates the delivery
  *kind* but not the template, so a top-up order can carry one (and `login_topup`'s admin
  editor offers to create one). Rendering it whenever it exists is what stops delivered
  credentials being silently invisible.

Adding a section? Put it in this order and give it an explicit render condition. A
section that always renders on every state is usually a sign it belongs in the sidebar.

---

## Cards

Every card is the same shape. Only padding varies, by role.

```tsx
rounded-2xl border border-border bg-card shadow-soft
```

| Role | Padding | Example |
|---|---|---|
| Secondary / list card | `p-4 sm:p-5` | `AccountDetails`, `OrderTimeline`, `DeliveredSummary` |
| State centrepiece | `p-5 sm:p-6` | `PaymentCard`, `VerifyingCard`, `LoginActionCard` |
| Inset panel inside a card | `p-3 sm:p-3.5` | UTR echo box, message preview |
| Note strip (not a card) | `p-3.5 sm:p-4` + `rounded-xl` | Security warning |

The centrepiece gets more padding because it is the thing the customer came to act on.
A note strip is deliberately smaller and `rounded-xl`, so it reads as subordinate.

**Tinted card variants** — swap only the border, keep the rest:

```tsx
border-secondary/20   /* action needed  */
border-success/30     /* positive       */
border-warning/30     /* caution        */
```

### Card anatomy

**Section card** — heading left, count chip right, content below:

```tsx
<section className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
  <div className="mb-4 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      <RiFileListLine className="text-secondary" />
      <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
        Account details
      </h2>
    </div>
    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      3 fields
    </span>
  </div>
  {/* content */}
</section>
```

The leading icon is `text-secondary` and unsized (inherits) — `text-success` when the
card reports something completed. The count chip is optional; use it only when a count
tells the reader something (`3 fields`, `2 updates`).

Header bottom margin depends on what follows: `mb-4` before a grid or tile block, `mb-1`
before divider rows (the first row's own `py-3` supplies the gap). `AccountDetails` omits
the leading icon because its heading sits directly above divider rows — the icon added
visual weight the flat list didn't need.

**State centrepiece** — centred, icon → heading → body → action:

```tsx
<motion.section className="rounded-2xl border border-border bg-card p-5 text-center shadow-soft sm:p-6">
  {/* icon or radar, mx-auto */}
  <h2 className="mt-5 text-lg font-extrabold leading-tight tracking-tight text-foreground sm:text-xl">…</h2>
  <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">…</p>
  {/* inset panel / CTA at mt-4 or mt-5 */}
</motion.section>
```

Centrepieces are centre-aligned; section cards are left-aligned. Body copy in a
centrepiece gets `mx-auto max-w-md` so the line length stays readable.

**Banner strip** — for a card that leads with a status label above its body:

```tsx
<div className="overflow-hidden rounded-2xl border border-success/30 bg-card shadow-soft">
  <p className="bg-success/10 px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-success">
    One quick step to get your top-up
  </p>
  <div className="p-5 text-center sm:p-6">{/* body */}</div>
</div>
```

`overflow-hidden` is required — without it the tinted strip corners escape the card
radius. Used by `LoginActionCard` and `AdminMessageCard`.

### Radius

| Value | Use |
|---|---|
| `rounded-2xl` | Cards |
| `rounded-xl` | Panels, buttons, inputs, note strips |
| `rounded-lg` | Small icon tiles, toggle thumbs |
| `rounded-full` | Pills, chips, dots, avatars |

Never nest the same radius — a `rounded-xl` panel inside a `rounded-2xl` card, a
`rounded-lg` thumb inside a `rounded-xl` track.

---

## Type scale

The important rule: **h2 has two tiers.** Everything at one size is why a page reads
flat.

| Role | Classes |
|---|---|
| Hero h1 | `text-xl font-extrabold leading-tight tracking-tight sm:text-2xl` |
| **Centrepiece h2** | `text-lg font-extrabold leading-tight tracking-tight sm:text-xl` |
| **Section h2** | `text-base font-bold tracking-tight sm:text-lg` |
| h3 | `text-sm font-bold tracking-tight sm:text-base` |
| Body | `text-xs leading-relaxed sm:text-sm` |
| Fine / meta | `text-[11px] sm:text-xs` |
| Micro-label | `text-[10px] font-bold uppercase tracking-wider` |
| Data value | `text-sm font-bold tracking-tight` + `tabular-nums` |

Centrepiece = the state card (Complete payment, We're verifying your payment, Message us
to start delivery). Section = a supporting card (Account details, Order timeline,
Delivery summary).

**Micro-labels are flat `text-[10px]` with no `sm:` step.** They are already at the floor;
a responsive step on them was the source of arbitrary `10px`/`11px` drift.

Never exceed `sm:text-2xl` on this page. `sm:text-3xl` competes with the hero.

Apply `tracking-tight` to headings and data values, `tracking-wider` to uppercase
micro-labels. Use `tabular-nums` wherever digits align — amounts, UTRs, timestamps.

---

## Spacing

| Relationship | Value |
|---|---|
| Card to card | `space-y-3 sm:space-y-4` |
| Heading to its body | `mt-1.5` / `mt-2` |
| Block to block inside a card | `mt-4` / `mt-5` |
| Icon to label | `gap-2` |
| Label to value | `mt-1.5` |
| Divider row padding | `py-3` (+ `last:border-0 last:pb-0`) |

Card-to-card is tighter than the padding *inside* a card. That is deliberate: the stack
should read as one group rather than compete with each card's internal rhythm.

Use flex/grid + `gap` for sibling groups. Do not use per-element margins that collapse
or double.

---

## Rows

Two row patterns, both valid; pick by content length.

**Divider rows** — receipt-style, for short label/value pairs:

```tsx
<div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0 last:pb-0">
  <span className="text-xs font-semibold text-muted-foreground sm:text-sm">{label}</span>
  <span className="text-xs font-bold tracking-tight text-foreground sm:text-sm">{value}</span>
</div>
```

Used by `AccountDetails`, `DeliveredSummary`.

**Boxed tiles** — for values that wrap, or when each field needs separation:

```tsx
<div className="rounded-xl border border-border bg-muted/60 p-3 sm:p-3.5">
```

---

## State colour

Each lifecycle state has one hue, used consistently in the hero pill, stepper, and
centrepiece.

| State | Hue | Token |
|---|---|---|
| `awaiting_payment` | Amber | `warning` (hero pill uses `amber-400` on the dark gradient) |
| `verifying` | Sky | `sky-*` on gradient, `secondary` on light surfaces |
| `processing` | Indigo | `secondary` |
| `processing` (login) | Amber — *action needed* | `warning` |
| `delivered` | Emerald | `success` |
| `closed` | Slate | `muted-foreground` |

A paid `login_topup` deliberately uses the **amber action** treatment, not the indigo
processing one: the order is blocked on the customer, so it must not look like a passive
wait.

---

## Motion

`framer-motion` v12. Restraint is the rule — over-animation is the most common way these
cards start looking cheap.

**Card entry** — every card, identical:

```tsx
initial={{ opacity: 0, y: 14 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.28, ease: "easeOut" }}
```

Add `delay: 0.06` only for a card that should land after its hero.

**Radar rings** (`VerifyingCard`, `ProcessingCard`):

```tsx
className="absolute inset-0 rounded-full border-2 border-secondary/50"
animate={{ scale: [0.7, 1.1], opacity: [0.7, 0] }}
transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay }}
// delays: [0, 0.8, 1.6]
```

**Ring opacity multiplies.** The border alpha (`/50`) times the animated opacity (`0.7`)
is the peak visible value (~0.35). An earlier attempt at `/25 × 0.35` produced ~0.09 —
technically animating, visually invisible. Soften with *duration and scale*, not by
fading toward zero.

**Pulse dot** — `animate={{ opacity: [1, 0.4, 1] }}`, `duration: 2.4`. Opacity only; no
scale, no glow.

Icon core inside a radar: **70% of the ring diameter** (`h-14` core in an `h-20` ring;
`sm:h-16` in `sm:h-24`). Below that the icon reads as too small.

Respect `prefers-reduced-motion`.

---

## Responsive

Mobile-first. Must hold at **320 / 375 / 768 / 1280**.

- Page: `px-3 sm:px-6 lg:px-8`
- Grid: `grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]`, sidebar `lg:sticky lg:top-28`
- Rows: `flex-col` on mobile → `sm:flex-row sm:justify-between` where the pair fits
- Wide content (tables, code) gets its own `overflow-x-auto`; the page body must never
  scroll sideways

### The stepper constraint

`hero/OrderStepper.tsx` is the tightest element on the page and the easiest to break.

- 4 steps at 320px → ~72px per column; widest label "Delivered" ≈ 41.6px at `text-[9px]`
- 5 steps (login flow) at 320px → ~53.6px per column; "Contact us" ≈ 49.0px — **3px of
  slack**

Labels are `text-[9px] sm:text-[11px]`. **Do not increase the label font size** without
re-measuring the 5-step case. If you add a step, re-measure.

---

## Accessibility

- Icon-only buttons need `aria-label` (reveal toggles, copy actions)
- Decorative elements — rings, glows, gradient overlays — need `aria-hidden="true"` and
  `pointer-events-none`
- Progress steppers: `<ol>` / `<li>`, with `sr-only` text marking the current step
- Accordions: `aria-expanded` on the trigger
- Toggle groups: `aria-pressed` on each option

---

## Sensitive values

`login_topup` collects the customer's own game password. Anything password-shaped is
masked behind a reveal toggle — never printed in plain text on a page the customer may
have open in public.

```tsx
export function isPassword(fieldKey?: string | null) {
  return fieldKey === "password";
}
```

Key on `fieldKey`, not on the label — labels are admin-editable and unreliable.
`DeliveredSummary` omits the password entirely: it is a receipt, not the login form.

**Known limitation:** the raw value still ships in the RSC payload, because the server
passes the whole `order` to a client component. The masking is shoulder-surfing
protection, not a security boundary. A real fix means trimming what the API returns.

---

## Reuse

Do not rebuild these.

| Component | Provides |
|---|---|
| `UpiQrCheckout` | QR, payee, UPI ID, reference, copy buttons, 12-digit UTR validation |
| `DeliveryCard` | Credentials (masked + reveal) and redeem-code delivery |
| `AdminMessageCard` | Sanitized admin note, "Order Update" card |
| `lib/formatDateTime.ts` | UTC formatting, duration, UTR grouping |
| `lib/constants/support.ts` | WhatsApp number + `wa.me` link builder |

**Dates must be formatted in UTC** with `suppressHydrationWarning` on the element.
`toLocaleString()` renders differently on server and client, which React reports as a
hydration mismatch. `lib/formatDateTime.ts` exists for this; use it.

---

## Checklist

Before shipping a change to these screens:

- [ ] No raw palette classes on light surfaces — tokens only
- [ ] No `dark:` variants
- [ ] Card uses `rounded-2xl border border-border bg-card shadow-soft` + role padding
- [ ] Heading picked the right h2 tier (centrepiece vs section)
- [ ] Micro-labels flat `text-[10px]`, no `sm:` step
- [ ] Headings capped at `sm:text-2xl`
- [ ] Dates via `lib/formatDateTime.ts` + `suppressHydrationWarning`
- [ ] Icon-only buttons have `aria-label`; decorative elements `aria-hidden`
- [ ] Checked at 320px — stepper labels on one line, no horizontal scroll
- [ ] `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` compiles
