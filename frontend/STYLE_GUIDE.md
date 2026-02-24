# TopUpIO Style Changes Log

> **Date:** February 8, 2026  
> **Summary:** Documentation of styling changes made during this session

---

## 🎨 1. Dark Theme for Navbar & Footer

### Navbar Background
Changed from transparent dark to solid dark slate:

```diff
- bg-black/20 backdrop-blur-xl border-b border-white/10
+ bg-slate-900/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-b border-slate-700/50  (scrolled)
+ bg-slate-900/90 backdrop-blur-md border-b border-slate-800/50  (default)
```

### Navbar Button Hover States
```diff
- hover:bg-white/10
+ hover:bg-slate-800
```

### Navbar Text Colors
```diff
- text-white, text-gray-400
+ text-white, text-slate-300  (nav links)
```

### Footer Background
```diff
- bg-linear-to-b from-slate-950 to-slate-900 text-white
+ bg-slate-900 border-t border-slate-700/50
```

### Footer Text Colors
```diff
- text-white, opacity-80
+ text-white (headings), text-slate-400 (body text)
```

### Footer Helper Components
```diff
- bg-muted border-border text-muted-foreground
+ bg-slate-800 border-slate-700 text-slate-400
```

---

## 📝 2. Responsive Typography

### Section Headings (HotProducts, GameCategoryListing)
```diff
- text-2xl font-semibold
+ text-lg sm:text-2xl font-bold tracking-tight
```

### Section Subtitles
```diff
(new) text-gray-500 text-xs sm:text-sm font-normal
```

### Card Titles (SingleProductCard)
```diff
- text-sm
+ text-sm sm:text-base
```

---

## 📐 3. Responsive Spacing

### Section Header Margins
```diff
- mb-4 or mb-10
+ mb-4 sm:mb-6
```

### Link Gap Spacing
```diff
- gap-2
+ gap-1 sm:gap-2
```

### Section Top Margins
```diff
HotProducts:    mt-8 lg:mt-14  →  mt-8 lg:mt-16
CategoryListing: mt-10         →  mt-16 lg:mt-24
```

---

## 🏷️ 4. New Section Header Pattern

Added icon containers with section headers — **responsive sizing** for mobile:

```diff
// Icon container gap
- gap-4
+ gap-2 sm:gap-3

// Icon container size
- w-10 h-10 sm:w-12 sm:h-12
+ w-8 h-8 sm:w-10 sm:h-10

// Icon container rounding
- rounded-xl sm:rounded-2xl
+ rounded-lg sm:rounded-xl

// Icon size (use className instead of fixed size prop)
- <Icon size={28} />
+ <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
```

```tsx
// HotProducts (tertiary theme)
<div className="flex items-center gap-2 sm:gap-3">
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
        <RiFlashlightFill className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
    </div>

// GameCategoryListing (secondary theme)
<div className="flex items-center gap-2 sm:gap-3">
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
        <RiLayoutGridFill className="w-4 h-4 sm:w-5 sm:h-5" />
    </div>
```

---

## 🔗 5. View All Links

New animated link pattern:

```diff
- text-white hover:underline
+ text-gray-500 hover:text-secondary transition-colors group
+ <RiArrowRightSLine className="group-hover:translate-x-1 transition-transform" />
```

---

## ⭐ 6. Star Rating System (SingleProductCard)

**New feature added:**

```tsx
// Imports
import { RiStarFill, RiStarHalfFill } from "react-icons/ri";

// Deterministic rating generation (4.0 - 5.0)
const rating = useMemo(() => {
    const productId = product._id || product.name || "";
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
        hash = ((hash << 5) - hash) + productId.charCodeAt(i);
        hash |= 0;
    }
    const normalized = Math.abs(hash % 11) / 10;
    return (4.0 + normalized).toFixed(1);
}, [product._id, product.name]);

// Star color
className="text-amber-400" size={12}
```

---

## 💰 7. Price Display (SingleProductCard)

Removed "Starting from" label, added strikethrough for original price:

```diff
- <p className="text-[10px] text-muted-foreground uppercase">Starting from</p>
- <span className="text-secondary font-bold text-lg">${price}</span>

+ <div className="flex items-center gap-2">
+     <span className="text-secondary font-bold text-lg">${discountedPrice}</span>
+     {hasDiscount && (
+         <span className="text-muted-foreground text-sm line-through">${originalPrice}</span>
+     )}
+ </div>
```

---

## 🃏 8. Card Container Changes

### GameCardsBox
```diff
- rounded-xl p-5 bg-white/5 backdrop-blur-xl border border-white/10
+ rounded-2xl p-6 bg-white border border-gray-200 hover:border-gray-300 transition-colors
```

Added title underline accent:
```tsx
<div className="h-1 w-12 bg-secondary rounded-full mt-1" />
```

### Swiper Slide Widths
```diff
- !w-[85%] sm:!w-[60%] lg:!w-[30%]
+ !w-[45%] sm:!w-[35%] lg:!w-[22%]
```

---

## 📱 9. Mobile-Specific Additions

### Hidden View All on Mobile (GameCategoryListing)
```tsx
// Desktop: hidden sm:flex
<Link className="hidden sm:flex items-center ...">

// Mobile alternative
<div className="mt-8 flex justify-center sm:hidden">
    <Link className="flex items-center gap-2 text-sm text-secondary font-medium">
```

---

## 🎯 Quick Reference

| Change Area | Old | New |
|------------|-----|-----|
| Navbar/Footer BG | `bg-black/20`, gradients | `bg-slate-900` |
| Dark borders | `border-white/10` | `border-slate-700/50` |
| Dark hover | `hover:bg-white/10` | `hover:bg-slate-800` |
| Light text on dark | `text-gray-400` | `text-slate-300`, `text-slate-400` |
| Section headings | `text-2xl` | `text-lg sm:text-2xl` |
| Header margins | `mb-4`, `mb-10` | `mb-4 sm:mb-6` |
| Link gaps | `gap-2` | `gap-1 sm:gap-2` |
| Icon container size | `w-10 h-10 sm:w-12 sm:h-12` | `w-8 h-8 sm:w-10 sm:h-10` |
| Icon container gap | `gap-4` | `gap-2 sm:gap-3` |
| Icon container rounding | `rounded-xl sm:rounded-2xl` | `rounded-lg sm:rounded-xl` |
| Icon sizing | `size={28}` | `className="w-4 h-4 sm:w-5 sm:h-5"` |
| Star rating color | - | `text-amber-400` |

---

## 🎮 10. Game Variant Card (VariantGrid)

> **Date:** February 24, 2026
> **Component:** `gameDetails/VariantGrid.tsx`

### Grid Layout
```tsx
// Responsive columns: 2 on mobile, 4 on sm+
grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3
```

### Card Container
```tsx
// Consistent rounding, responsive padding
rounded-2xl p-2 sm:p-3 border transition-all duration-300 ease-out

// Default state
border-border bg-card hover:border-secondary/60 hover:bg-muted hover:shadow-md shadow-sm

// Selected state
border-secondary bg-secondary/10 ring-2 ring-secondary/40 shadow-md
```

### Badges (Discount / Popular / Selected)
```tsx
// Positioned absolute, top corners
absolute top-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full shadow

// Discount badge (top-left): bg-tertiary text-primary
// Popular badge (top-right): bg-tertiary text-primary
// Selected badge (top-right): bg-secondary text-white font-semibold
```

### Image
```tsx
// Square aspect ratio, rounded corners, zoom on hover
relative overflow-hidden rounded-xl aspect-square
img: w-full h-full object-cover transition-transform duration-500 group-hover:scale-110
// Gradient overlay on hover
bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity
```

### Text Layout (all left-aligned)
```tsx
// Variant name
text-sm sm:text-base text-left font-semibold tracking-wide
// Selected: text-secondary | Default: text-foreground group-hover:text-secondary

// Quantity/unit
text-[10px] text-left sm:text-xs text-muted-foreground

// Content wrapper spacing
mt-2 sm:mt-3 (after image) | space-y-0.5 sm:space-y-1
```

### Price Display (left-aligned)
```tsx
// Price row
mt-2 sm:mt-3 space-y-0.5
flex items-center gap-1 sm:gap-2

// Discounted price
text-secondary font-bold text-sm sm:text-base

// Original price (strikethrough)
text-muted-foreground text-xs sm:text-sm line-through

// Save amount
text-tertiary text-xs sm:text-sm font-medium
```

### Quick Reference

| Element | Mobile | Desktop (sm+) |
|---------|--------|----------------|
| Grid cols | `grid-cols-2` | `grid-cols-4` |
| Grid gap | `gap-2` | `gap-3` |
| Card padding | `p-2` | `p-3` |
| Card rounding | `rounded-2xl` | `rounded-2xl` |
| Card shadow | `shadow-sm` | `shadow-sm` (hover/selected: `shadow-md`) |
| Content spacing | `mt-2`, `space-y-0.5` | `mt-3`, `space-y-1` |
| Variant name | `text-sm` | `text-base` |
| Quantity text | `text-[10px]` | `text-xs` |
| Price | `text-sm` | `text-base` |
| Strikethrough | `text-xs` | `text-sm` |
| Save text | `text-xs` | `text-sm` |
| Price gap | `gap-1` | `gap-2` |

---

## 🧾 11. Sidebar Cards (CheckoutCard & UserDetailsForm)

> **Date:** February 16, 2026
> **Components:** `gameDetails/CheckoutCard.tsx`, `gameDetails/UserDetailsForm.tsx`

These two cards sit side-by-side in the right sidebar on desktop. Their text sizes **must match** to maintain visual consistency.

### Shared Card Container
```tsx
bg-card p-6 rounded-2xl border border-border shadow-sm
```

### Shared Text Hierarchy (sidebar panels)
```tsx
// Card heading
text-lg font-bold text-secondary mb-4

// Body / row text
text-sm text-muted-foreground

// Labels (form fields)
text-sm font-medium text-foreground

// Helper / secondary text
text-xs text-muted-foreground

// Emphasis values (prices on right side)
text-foreground font-semibold
```

### CheckoutCard Specifics
```tsx
// Content wrapper
space-y-3 text-sm

// Product row
flex justify-between text-muted-foreground
// Name: truncate mr-2 | Price: text-foreground font-semibold shrink-0

// Discount row
flex justify-between text-tertiary

// Itemized row (smallest text for secondary info)
flex justify-between text-muted-foreground text-xs

// Quantity selector
flex items-center gap-3 bg-muted px-3 py-2 rounded-xl
// Icons: cursor-pointer text-tertiary
// Qty number: text-foreground font-semibold

// Total row (largest text — key emphasis)
flex justify-between text-foreground font-bold text-lg

// CTA button
w-full py-3 rounded-xl bg-secondary text-white font-semibold
hover:bg-tertiary hover:text-gray-950 transition

// Floating point fix: all computed values use .toFixed(2)
```

### UserDetailsForm Specifics
```tsx
// Input fields
px-4 py-2 bg-input border text-foreground rounded-xl
placeholder-muted-foreground
focus:outline-none focus:border-secondary focus:ring-2 focus:ring-ring/30

// Dropdown
Same as input + appearance-none
// Arrow icon: absolute right-3 top-3 text-muted-foreground pointer-events-none

// Error text
text-red-500 text-xs mt-1

// Footer helper
text-xs text-muted-foreground mt-3
```

### Design Rule: Sidebar Consistency
When adding new sidebar panels on the game details page, follow this sizing:

| Element | Size | Weight |
|---------|------|--------|
| Panel heading | `text-lg` | `font-bold text-secondary` |
| Primary rows | `text-sm` | normal or `font-semibold` for values |
| Secondary/itemized | `text-xs` | `text-muted-foreground` |
| Total/emphasis | `text-lg` | `font-bold text-foreground` |
| Form labels | `text-sm` | `font-medium text-foreground` |
| Helper text | `text-xs` | `text-muted-foreground` |
| Error text | `text-xs` | `text-red-500` |

> **Key principle:** Sidebar cards use compact `text-sm` body text to keep the panel tight and not compete visually with the main content area (variant grid, descriptions). Only the Total row gets `text-lg` for emphasis.

---

*This log documents styling changes. Last updated: February 24, 2026.*
