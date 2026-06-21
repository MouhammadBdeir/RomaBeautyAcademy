// Next.js 16: "Proxy" ersetzt die frühere "Middleware" (gleiche Funktion).
// Hier nur ein optimistischer Check (ist ein Session-Cookie vorhanden?).
// Die echte Autorisierung passiert serverseitig in /admin via requireAdmin().
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "__session";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Login & Registrierung sind öffentlich erreichbar.
    if (pathname === "/admin/login" || pathname === "/admin/register") {
        return NextResponse.next();
    }

    // Ohne Session-Cookie direkt zum Login.
    if (!request.cookies.has(SESSION_COOKIE)) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/admin/:path*",
};
