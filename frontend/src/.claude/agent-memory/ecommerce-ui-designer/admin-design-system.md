---
name: admin-design-system
description: Non-obvious conventions and inconsistencies in the game-topup admin UI (DataTable, toolbars, pills, money formatting) — what to match and which of two competing toolbar styles to pick
metadata:
  type: project
---

The admin panel has **two competing toolbar styles**, and picking the wrong one makes a new page look grafted on.

- **Wallet section** (`components/admin/wallet/*`): bare filter row, no card wrapper — `mb-4 flex flex-wrap items-end gap-3`, `FilterDropdown` + native date inputs, `focus:border-secondary`, accent is `secondary`.
- **Users section** (`components/admin/users/UsersToolbar.tsx`): filters wrapped in a white `rounded-2xl` card, icon-prefixed inputs, blue accent (`focus:ring-blue-100`), a Clear button.

**Why:** they were built at different times and never reconciled. Neither is "the" system.

**How to apply:** match the *section* you are building in, not the prettiest one. Anything under `/admin/wallet` follows the wallet style and uses `text-secondary`/`border-secondary` as the accent; the blue used in users/`FilterDropdown` (indigo-500, blue-100) is foreign to the wallet section.

Other conventions confirmed in code:
- `DataTable` (`components/admin/shared/DataTable.tsx`) owns the card chrome itself (`bg-white rounded-xl shadow-sm border border-gray-300`). Do **not** wrap it in another bordered card — `UsersTable` does and ends up with a double border. Its built-in empty state is a plain "No items available" row; the wallet pages override it by rendering a dashed-border empty block *instead of* the table.
- `Pagination`'s rows-per-page options are hardcoded `[12, 24, 50, 100]`. Wallet endpoints cap `limit` at 50 (transactions at 100), so picking 100 on a wallet-list page silently returns 50 — pass a `limit` the endpoint honours and be aware the selector can offer more than the API allows.
- Money: always `formatFixed(paise / 100, "INR")` or `formatPaiseAsInr(paise)` from `lib/utils/money.ts`. Output is `en-US`-grouped (`₹1,250.00`), not Indian lakh grouping — consistent across the app, don't hand-roll a different grouping for one table.
- Status pills: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border` + a `w-1.5 h-1.5 rounded-full` dot. green-50/700/200 active, red-50/700/200 blocked.
- Loading convention in the wallet section is `pointer-events-none opacity-50` on the results wrapper (keeps old rows visible), not a spinner or skeleton.
- Icons: wallet/users admin uses `react-icons/tb`; `Pagination` uses `react-icons/fa`. Prefer `tb` for new admin UI.
