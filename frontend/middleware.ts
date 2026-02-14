import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN_PATH = "/admin/login";

function decodeJwtPayload(token: string): { id?: string; role?: string } | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch {
        return null;
    }
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname === LOGIN_PATH) return NextResponse.next();

    const token = req.cookies.get("token")?.value;
    if (!token) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = LOGIN_PATH;
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Decode JWT payload to check role (no signature verification — backend validates on data fetch)
    const payload = decodeJwtPayload(token);
    console.warn("userrole",payload?.role);
    
    if (!payload || payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
