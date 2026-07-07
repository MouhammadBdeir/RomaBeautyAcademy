// Login (POST): tauscht ein verifiziertes ID-Token gegen ein Session-Cookie.
// Logout (DELETE): löscht das Session-Cookie.
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { createSession, clearSession } from "@/lib/auth/session";
import { addLog } from "@/lib/logs/server";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const idToken = body?.idToken;

    if (!idToken || typeof idToken !== "string") {
        return NextResponse.json({ error: "idToken fehlt." }, { status: 400 });
    }

    let decoded;
    try {
        decoded = await adminAuth().verifyIdToken(idToken, true);
    } catch {
        return NextResponse.json({ error: "Ungültiges Token." }, { status: 401 });
    }

    const owner = process.env.ADMIN_OWNER_EMAIL?.toLowerCase();
    const isOwnerEmail = !!decoded.email && !!owner && decoded.email.toLowerCase() === owner;
    const isAdmin = decoded.admin === true || isOwnerEmail;

    if (!isAdmin) {
        return NextResponse.json(
            { error: "Dein Konto ist noch nicht als Admin freigegeben." },
            { status: 403 },
        );
    }

    await createSession(idToken);
    await addLog({ category: "admin", message: `Login: ${decoded.email ?? decoded.uid}`, actor: decoded.email ?? null });
    return NextResponse.json({ ok: true });
}

export async function DELETE() {
    await clearSession();
    return NextResponse.json({ ok: true });
}
