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
(new) text-gray-500 text-xs sm:text-sm font-medium
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

Added icon containers with section headers:

```tsx
// HotProducts (tertiary theme)
<div className="w-10 h-10 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
    <RiFlashlightFill size={24} className="animate-pulse" />
</div>

// GameCategoryListing (secondary theme)  
<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
    <RiLayoutGridFill size={28} />
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
| Star rating color | - | `text-amber-400` |

---

*This log documents only the changes made during the February 8, 2026 session.*
