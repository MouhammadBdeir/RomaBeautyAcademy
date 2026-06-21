// Server-seitiges Session-Handling auf Basis von Firebase Session-Cookies.
// (Nur aus Server-Komponenten / Route-Handlern importieren.)
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";

const SESSION_COOKIE = "__session";
// 5 Tage (innerhalb des von Firebase erlaubten Bereichs 5 Min … 14 Tage).
const SESSION_EXPIRES_IN_MS = 1000 * 60 * 60 * 24 * 5;

export type SessionClaims = {
    uid: string;
    email?: string;
    admin: boolean;
    owner: boolean;
};

function isOwnerEmail(email?: string): boolean {
    const owner = process.env.ADMIN_OWNER_EMAIL;
    return !!email && !!owner && email.toLowerCase() === owner.toLowerCase();
}

/** Tauscht ein frisches ID-Token gegen ein Session-Cookie und setzt es (httpOnly). */
export async function createSession(idToken: string): Promise<void> {
    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
        expiresIn: SESSION_EXPIRES_IN_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: Math.floor(SESSION_EXPIRES_IN_MS / 1000),
    });
}

export async function clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}

/** Liest + verifiziert das Session-Cookie. Gibt null zurück, wenn ungültig. */
export const verifySession = cache(async (): Promise<SessionClaims | null> => {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;
    if (!session) return null;

    try {
        // true = Widerruf prüfen (z. B. nach Logout/Passwortänderung).
        const decoded = await adminAuth().verifySessionCookie(session, true);
        const ownerByEmail = isOwnerEmail(decoded.email);
        return {
            uid: decoded.uid,
            email: decoded.email,
            admin: decoded.admin === true || ownerByEmail,
            owner: decoded.owner === true || ownerByEmail,
        };
    } catch {
        return null;
    }
});

/** Server-Guard: erzwingt einen eingeloggten Admin, sonst Redirect zum Login. */
export async function requireAdmin(): Promise<SessionClaims> {
    const session = await verifySession();
    if (!session || !session.admin) {
        redirect("/admin/login");
    }
    return session;
}
