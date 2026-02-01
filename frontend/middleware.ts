import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN_PATH = "/admin/login";
const HOME_PATH = "/";

export async function middleware(req: NextRequest) {
    const { pathname, origin } = req.nextUrl;

    // Fast path: allow login page immediately (no allocations)
    if (pathname === LOGIN_PATH) {
        return NextResponse.next();
    }

    const cookie = req.headers.get("cookie");

    // Fast fail: no cookies means no session → redirect
    if (!cookie) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = LOGIN_PATH;
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // Call backend API to verify authentication
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
        const res = await fetch(`${apiBase}/api/auth/me`, {
            headers: { cookie },
            credentials: "include",
            cache: "no-store",
        });

        // Unauthenticated
        if (res.status !== 200) {
            const loginUrl = req.nextUrl.clone();
            loginUrl.pathname = LOGIN_PATH;
            loginUrl.searchParams.set("from", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Avoid JSON parsing if not needed
        const { user } = await res.json();

        // Authenticated but wrong role
        if (user?.role !== "admin") {
            return NextResponse.redirect(new URL(HOME_PATH, origin));
        }

        // Authenticated admin
        return NextResponse.next();
    } catch {
        // Network failure → safest fallback is login
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = LOGIN_PATH;
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: ["/admin/:path*"],
};
