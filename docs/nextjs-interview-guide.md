# 🚀 Next.js Interview Prep — From Your Game Topup Codebase

Your project uses **Next.js 16 (canary)** with the **App Router**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. This guide maps every key Next.js concept to your actual code so you can explain them with real examples.

---

## 1. App Router & File-Based Routing

**Interview Q: "How does routing work in Next.js App Router?"**

> Every file named `page.tsx` inside `src/app/` becomes a route. Folders = URL segments.

```
src/app/
├── (user)/page.tsx         → /          (home)
├── (user)/games/[slug]/    → /games/clash-of-clans
├── (user)/blogs/[slug]/    → /blogs/my-blog-post
├── (user)/orders/[id]/     → /orders/abc123
├── login/page.tsx          → /login
├── signup/page.tsx         → /signup
├── search/page.tsx         → /search
├── admin/dashboard/page.tsx → /admin/dashboard
├── admin/games/[id]/       → /admin/games/abc123
├── verify-email/[token]/   → /verify-email/xyz456
```

**Your 33 pages** are generated purely from the folder structure — no router configuration needed.

---

## 2. Dynamic Routes — `[slug]` and `[id]`

**Interview Q: "How do you create dynamic pages?"**

> Wrap the folder name in brackets: `[slug]` or `[id]`.

📁 `src/app/(user)/games/[slug]/page.tsx`

```tsx
export default async function GameSlugPage({
    params,
}: {
    params: Promise<{ slug: string }>;  // ⬅ In Next.js 15+, params is a Promise
}) {
    const { slug } = await params;
    const gameDetailResponse = await gamesApiServer.get(slug);
    return <GameDetailsPage gameDetails={gameDetailResponse.data} />;
}
```

> ⚠️ **IMPORTANT**: In **Next.js 15+**, `params` is a `Promise` — you must `await` it. This is a breaking change from Next.js 14 where params was a plain object. **This is a very common interview question.**

---

## 3. Layouts — Shared UI Across Pages

**Interview Q: "What are layouts and how do they work?"**

> A `layout.tsx` wraps all pages in its directory and child directories. Layouts **persist across navigations** — they don't re-render when you navigate between sibling pages.

### Root Layout — `src/app/layout.tsx`

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider>           {/* Dark/light mode */}
                    <GoogleOAuthWrapper>  {/* Google auth */}
                        <AuthProvider>    {/* User session */}
                            {children}
                            <ToastContainer />
                        </AuthProvider>
                    </GoogleOAuthWrapper>
                </ThemeProvider>
            </body>
        </html>
    );
}
```

### User Layout — `src/app/(user)/layout.tsx`
Adds Navbar + Footer for public pages only.

### Admin Layout — `src/app/admin/layout.tsx`
Adds AdminNavbar + AdminSidebar, plus **client-side auth guards**.

> 💡 **Nesting**: Root Layout → (user) Layout → Page. Each layout only wraps its children but **doesn't remount** on navigation. This is perfect for persistent sidebars, navbars, etc.

---

## 4. Route Groups — `(user)`

**Interview Q: "What are route groups? Why use parentheses?"**

> Folders in parentheses `(user)` create **organizational grouping without affecting the URL**.

```
src/app/(user)/games/[slug]/page.tsx  →  URL: /games/some-game  (NOT /user/games/some-game)
```

Your project uses `(user)` to group public-facing pages that share a Navbar+Footer layout, separate from `admin/` pages that have a completely different sidebar layout. **The parentheses are stripped from the URL.**

---

## 5. Server Components vs Client Components ⭐

**Interview Q: "What's the difference between Server and Client Components?"**

This is the **#1 most asked Next.js interview question**. Your project demonstrates both perfectly.

### Server Components (default — NO `"use client"`)

📁 `src/app/(user)/page.tsx` — **Your home page is a Server Component**

```tsx
// No "use client" → This is a Server Component!
export default async function Page() {
    // ✅ Can directly fetch data on the server
    const banners = await bannerApiServer.listActive();
    const homeRes = await gamesApiServer.listHomeGames();
    const paymentCatRes = await gamesApiServer.listPaymentCategories();
    // ✅ Data is fetched server-side, rendered to HTML, sent to client
    return <HeroCarousel banners={bannerData} />;
}
```

**Advantages**: No loading spinners, better SEO, smaller JavaScript bundle, faster page load.

### Client Components (`"use client"`)

📁 `src/components/user/homePage/HotGames.tsx`

```tsx
"use client";  // ⬅ This directive makes it a Client Component

import { Swiper, SwiperSlide } from "swiper/react";
// ✅ Can use browser APIs, event handlers, useState, useEffect
```

📁 `src/context/AuthContext.tsx`

```tsx
"use client";  // Must be client because it uses useState, useEffect, useContext
```

### When to use which?

| Use Server Component | Use Client Component |
|---|---|
| Fetching data | `useState`, `useEffect`, `useContext` |
| Accessing backend resources | Event handlers (`onClick`, `onChange`) |
| Keeping secrets on server | Browser APIs (`window`, `localStorage`) |
| Reducing client JS bundle | Interactive UI (forms, modals, carousels) |

> ⚠️ **The pattern your project uses**: Server Component pages fetch data → pass it as props → to Client Components for interactivity. This is the **recommended Next.js pattern**.

---

## 6. Data Fetching — Server-Side vs Client-Side

**Interview Q: "How do you fetch data in Next.js?"**

Your project has a **brilliant separation** — two different HTTP clients:

### Server-Side: `src/lib/http/server.ts`

```tsx
import { cookies } from "next/headers";

export const serverApi = {
    async get<T>(url: string): Promise<T> {
        const cookieStore = await cookies();
        const res = await fetch(url, {
            headers: { Cookie: cookieStore.toString() },
            cache: "no-store",  // ⬅ Always fresh data
        });
        return res.json();
    },
};
```

Used by: `gamesApiServer`, `bannerApiServer`, `blogApiServer`, etc.

### Client-Side: `src/lib/http/index.ts`

```tsx
"use client";
import axios from "axios";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,    // ⬅ Sends cookies automatically
});

// ✅ Auto-attaches CSRF token for POST/PUT/DELETE
// ✅ Auto-refreshes on 401 (token expired)
```

Used by: `authApi`, admin CRUD operations in the browser.

> 💡 **Interview gold**: "We use two HTTP layers — `serverApi` uses `fetch` with cookie forwarding for Server Components, while `clientApi` uses Axios with interceptors for Client Components. This separation ensures auth cookies work correctly in both environments."

### Why two separate HTTP clients?

In Next.js, Server Components and Client Components run in completely different environments, so a single HTTP client cannot serve both:

**`serverApi` (fetch-based) — runs on Node.js server:**
- Server Components have no browser — there is no automatic cookie jar
- Auth cookies (e.g. `access_token`) live in the browser and must be **manually forwarded** to the backend
- Uses Next.js `cookies()` to read the incoming request's cookies and attach them to the outgoing fetch call
- Without this, the backend would receive unauthenticated requests even if the user is logged in

```ts
// Manual cookie forwarding — required on the server
const cookieStore = await cookies();
const res = await fetch(url, {
    headers: { Cookie: cookieStore.toString() },
});
```

**`clientApi` (Axios-based) — runs in the browser:**
- The browser automatically sends cookies with every request via `withCredentials: true`
- No manual forwarding needed — the browser handles it
- Axios interceptors add extra logic: attaching CSRF tokens, auto-refreshing expired tokens on 401 responses
- This would not work in a Server Component because there is no browser, no `window`, and no cookie jar

```ts
// Browser handles cookies automatically
export const apiClient = axios.create({
    withCredentials: true,  // browser sends cookies on every request
});

// Interceptor: attach CSRF token to mutating requests
apiClient.interceptors.request.use((config) => {
    if (["post", "put", "delete"].includes(config.method!)) {
        config.headers["X-CSRFToken"] = getCsrfToken();
    }
    return config;
});

// Interceptor: auto-refresh token on 401
apiClient.interceptors.response.use(null, async (error) => {
    if (error.response?.status === 401) {
        await refreshToken();
        return apiClient(error.config); // retry original request
    }
    return Promise.reject(error);
});
```

**Summary table:**

| | `serverApi` | `clientApi` |
|---|---|---|
| Runs in | Node.js (server) | Browser (client) |
| HTTP library | `fetch` | Axios |
| Cookie handling | Manual forwarding via `cookies()` | Automatic via `withCredentials` |
| Interceptors | No | Yes (CSRF, token refresh) |
| Used by | Server Components, page data fetching | Client Components, user actions |

---

## 7. Middleware

**Interview Q: "What is middleware in Next.js and how have you used it?"**

📁 `middleware.ts` — lives at the **project root** (not inside `src/app/`)

```tsx
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    
    if (!token) {
        return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJwtPayload(token);
    if (!payload || payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],  // ⬅ Only runs on /admin/* routes
};
```

**Key points to mention in interview:**
- Middleware runs **at the Edge** before the page loads
- The `matcher` config limits which routes trigger the middleware
- It runs on **every request** to matched routes (including navigations)
- It can redirect, rewrite, or modify headers

---

## 8. Metadata & SEO — `generateMetadata`

**Interview Q: "How do you handle SEO in Next.js?"**

### Static Metadata — `src/app/layout.tsx`

```tsx
export const metadata: Metadata = {
    title: "Game Topup",
    description: "Generated by create next app",
};
```

### Dynamic Metadata — `src/app/(user)/blogs/[slug]/page.tsx`

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const res = await blogApiServer.get(slug);
    const blog = res.data;
    return {
        title: blog.seo?.metaTitle || blog.title,
        description: blog.seo?.metaDescription,
        keywords: blog.seo?.keywords,
        openGraph: { images: [blog.coverImage] },
    };
}
```

> **"We use `generateMetadata` on dynamic pages to fetch the blog/game data and set the page title, description, and Open Graph images dynamically — critical for SEO and social media sharing."**

---

## 9. Loading UI — `loading.tsx`

**Interview Q: "How do you show loading states in Next.js?"**

📁 `src/app/admin/loading.tsx`

```tsx
export default function Loading() {
    return (
        <div className="p-6 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-6" />
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 bg-muted rounded-lg" />
            ))}
        </div>
    );
}
```

> `loading.tsx` automatically wraps the page in a `<Suspense>` boundary. While the server component is fetching data, Next.js shows this skeleton. No manual Suspense needed!

---

## 10. Error Handling — `notFound()`

**Interview Q: "How do you handle 404s for dynamic routes?"**

📁 `src/app/(user)/blogs/[slug]/page.tsx`

```tsx
import { notFound } from "next/navigation";

export default async function BlogDetailsPage({ params }: Props) {
    let blog = null;
    try {
        const res = await blogApiServer.get(slug);
        blog = res.data;
    } catch (e) { /* handle */ }

    if (!blog) notFound();  // ⬅ Triggers the nearest not-found.tsx

    return <BlogDetailsClient blog={blog} />;
}
```

---

## 11. Next.js Navigation — `useRouter`, `Link`, `usePathname`

**Interview Q: "How does navigation work in Next.js?"**

### `Link` component (preferred for declarative navigation):
```tsx
import Link from "next/link";
<Link href="/categories">View All</Link>
```

### `useRouter` (for programmatic navigation in Client Components):
```tsx
import { useRouter } from "next/navigation";  // ⬅ NOT "next/router" (that's Pages Router)

const router = useRouter();
router.push("/");               // Navigate
router.replace("/admin/login"); // Replace (no back button)
router.refresh();               // Re-fetch server component data
```

### `usePathname` (get current URL path):
```tsx
import { usePathname } from "next/navigation";
const pathname = usePathname();  // "/admin/games"
```

Your admin layout uses all three:
```tsx
const pathname = usePathname();
useEffect(() => {
    setIsMobileOpen(false);  // Close mobile sidebar on route change
}, [pathname]);
```

---

## 12. `next.config.ts` — Configuration

📁 `next.config.ts`

```tsx
const nextConfig: NextConfig = {
    reactCompiler: true,  // ⬅ React Compiler (auto-memoizes components)
    images: {
        remotePatterns: [{
            protocol: "https",
            hostname: "res.cloudinary.com",
        }],
    },
};
```

**Interview points:**
- `reactCompiler: true` — enables the **React Compiler** which auto-optimizes re-renders (replaces manual `useMemo`/`useCallback`)
- `images.remotePatterns` — whitelists external image domains for Next.js `<Image>` component optimization

---

## 13. Google Fonts — `next/font`

📁 `src/app/layout.tsx`

```tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
```

**Why?** — Next.js **self-hosts** Google Fonts at build time. No external requests at runtime = better performance, no FOUT (Flash of Unstyled Text), and GDPR compliant.

---

## 14. Context & Providers Pattern

**Interview Q: "How do you manage state in a Next.js App Router project?"**

Your project uses a **clean providers pattern**:

```
Root Layout (Server Component)
  └─ ThemeProvider ("use client")          → Dark/light mode
      └─ GoogleOAuthWrapper ("use client") → Google sign-in
          └─ AuthProvider ("use client")   → User session state
              └─ {children}
```

**Key insight**: The root layout is a Server Component, but providers that use client-side state (`useState`, `useContext`) need `"use client"`. You separate them into dedicated files in `src/providers/`.

---

## 15. Custom Hooks

📁 `src/hooks/useAdminForm.ts`

```tsx
export function useAdminForm<T>(initialState: T, options = {}) {
    const router = useRouter();
    const [form, setForm] = useState<T>(initialState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = useCallback(async (onSubmit, e) => {
        e.preventDefault();
        await onSubmit(form);
        options.redirectPath && router.push(options.redirectPath);
        options.refreshAfterSubmit && router.refresh(); // ⬅ Re-fetches server data
    }, [form, router, options]);

    return { form, updateForm, loading, errors, handleSubmit };
}
```

> `router.refresh()` is a Next.js App Router feature that re-fetches the current route's server component data without a full page reload.

---

## 16. Image Optimization — `next/image`

**Interview Q: "How does Next.js optimize images?"**

Your config whitelists Cloudinary:
```tsx
images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
}
```

The `<Image>` component from `next/image`:
- Auto-resizes images based on device
- Serves modern formats (WebP/AVIF)
- Lazy loads images below the fold
- Prevents Cumulative Layout Shift (CLS)

---

## 17. Environment Variables

**Interview Q: "How do environment variables work in Next.js?"**

```
NEXT_PUBLIC_API_BASE=http://localhost:5000    ← Available in browser + server
SECRET_KEY=abc123                             ← Available ONLY on server
```

- Prefix with `NEXT_PUBLIC_` → exposed to the browser
- Without prefix → server-only (middleware, Server Components, API routes)

Your `src/config/api.ts` uses `process.env.NEXT_PUBLIC_API_BASE` so it works in both environments.

---

## 18. TypeScript with Next.js

Your project is fully typed:

```tsx
// Path aliases via tsconfig
"paths": { "@/*": ["./src/*"] }

// Usage everywhere:
import { authApi } from "@/services/authApi";
import { Game } from "@/lib/types/game";
```

---

## 🎯 Top 15 Interview Questions & Answers From YOUR Project

| # | Question | Your Answer (reference your code) |
|---|---|---|
| 1 | Server vs Client Components? | Home page = server (async data fetch), HotGames = client (Swiper carousel) |
| 2 | How does App Router routing work? | File-based: `(user)/games/[slug]/page.tsx` → `/games/clash-of-clans` |
| 3 | What are layouts? | `layout.tsx` persists across navigation — root adds providers, (user) adds Navbar/Footer |
| 4 | What are route groups? | `(user)` groups pages sharing same Navbar layout without affecting URLs |
| 5 | How do dynamic routes work? | `[slug]` folder, `params` is a `Promise` in Next.js 15+ |
| 6 | How do you fetch data? | Server: `async function Page()` + `serverApi.get()`. Client: Axios with interceptors |
| 7 | What is middleware? | `middleware.ts` at root — admin auth check running at Edge before page loads |
| 8 | How do you handle SEO? | `generateMetadata` for dynamic pages, `export const metadata` for static |
| 9 | How do loading states work? | `loading.tsx` = auto Suspense boundary showing skeleton UI |
| 10 | How do you handle 404s? | `notFound()` from `next/navigation` when data doesn't exist |
| 11 | How do you navigate? | `<Link>` for declarative, `useRouter().push()` for programmatic |
| 12 | How does `next/image` work? | Auto-optimization with remote patterns for Cloudinary images |
| 13 | How do env vars work? | `NEXT_PUBLIC_` prefix for browser access, without for server-only |
| 14 | What is React Compiler? | `reactCompiler: true` — auto-memoizes, replaces manual `useMemo`/`useCallback` |
| 15 | How do you manage state? | Context + Providers pattern with `"use client"` separation |

---

## 🔥 Bonus: Architecture Overview

```
Next.js App Router
│
├── middleware.ts ──────── Edge auth check for /admin/*
│
├── Root Layout ──────── Providers (Theme, Auth, Google OAuth)
│   │
│   ├── (user) Layout ── Navbar + Footer + PayPal
│   │   ├── Home Page (Server) ── fetches banners, games
│   │   ├── Game [slug] (Server) ── fetches game details
│   │   └── Blog [slug] (Server) ── fetches blog + generateMetadata
│   │
│   └── admin/ Layout ── Sidebar + AdminNavbar + Auth Guard
│       ├── Dashboard (Client) ── charts, stats
│       └── Games CRUD (Client) ── forms, tables
│
├── Data Layer
│   ├── serverApi (fetch + cookies) ── for Server Components
│   └── clientApi (Axios + CSRF + 401 refresh) ── for Client Components
│
└── Backend (Express + MongoDB)
    └── REST API at /api/*
```

---

> 💡 **Final tip**: When answering interview questions, always say *"In my project, I did..."* and reference specific examples. This shows practical experience, which is far more impressive than textbook answers. Good luck tomorrow! 🎯
