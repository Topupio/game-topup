import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN_PATH = "/admin/login";
const HOME_PATH = "/";



export async function middleware(req: NextRequest) {
    const { pathname, origin } = req.nextUrl;

    console.log("🔒 [Middleware] Running for:", pathname);

    // Fast path: allow login page immediately (no allocations)
    if (pathname === LOGIN_PATH) {
        console.log("✅ [Middleware] Login page - allowing through");
        return NextResponse.next();
    }

    const cookie = req.headers.get("cookie");
    console.log("🍪 [Middleware] Cookies:", cookie ? "PRESENT" : "MISSING");

    // Fast fail: no cookies means no session → redirect
    if (!cookie) {
        console.log("❌ [Middleware] No cookies - redirecting to login");
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = LOGIN_PATH;
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // Call API endpoint using NEXT_PUBLIC_API_BASE (avoids HTTP→HTTPS redirect issues behind nginx)
        const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "") || origin;
        const apiUrl = `${apiBase}/api/auth/me`;
        console.log("📡 [Middleware] Calling:", apiUrl);
        console.log("📡 [Middleware] With cookies:", cookie.substring(0, 50) + "...");

        const res = await fetch(apiUrl, {
            headers: { cookie },
            credentials: "include",
            cache: "no-store",
        });

        console.log("📡 [Middleware] Response status:", res.status);

        // Accept both 200 (OK) and 304 (Not Modified) as success
        // 304 is returned by Express when ETag matches (cached response)
        if (res.status !== 200 && res.status !== 304) {
            console.log("❌ [Middleware] Auth failed (status " + res.status + ") - redirecting to login");
            const loginUrl = req.nextUrl.clone();
            loginUrl.pathname = LOGIN_PATH;
            loginUrl.searchParams.set("from", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // For 304, we can't parse JSON (no body), but auth is valid
        if (res.status === 304) {
            console.log("✅ [Middleware] Auth valid (304 Not Modified) - allowing through");
            return NextResponse.next();
        }

        // Parse JSON response for 200
        const { user } = await res.json();
        console.log("👤 [Middleware] User role:", user?.role);

        // Authenticated but wrong role
        if (user?.role !== "admin") {
            console.log("❌ [Middleware] Not admin - redirecting to home");
            return NextResponse.redirect(new URL(HOME_PATH, origin));
        }

        // Authenticated admin
        console.log("✅ [Middleware] Admin authenticated - allowing through");
        return NextResponse.next();
    } catch (error) {
        // Network failure → safest fallback is login
        console.error("💥 [Middleware] Error:", error);
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = LOGIN_PATH;
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: ["/admin/:path*"],
};
