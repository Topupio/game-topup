import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN_PATH = "/admin/login";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname === LOGIN_PATH) return NextResponse.next();

    // Just check cookie exists — JWT is validated by backend on data fetch.
    // Admin layout provides client-side role verification.
    const token = req.cookies.get("token");
    if (!token) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = LOGIN_PATH;
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
