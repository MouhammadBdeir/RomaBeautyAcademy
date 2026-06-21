// Benutzerverwaltung (nur Owner): freigeben, ablehnen, Rechte entziehen,
// löschen, Passwort zurücksetzen.
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";
import { sendPasswordReset } from "@/lib/email";

const ACTIONS = ["approve", "reject", "revoke", "delete", "resetPassword"] as const;
type Action = (typeof ACTIONS)[number];

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || !session.owner) {
        return NextResponse.json({ error: "Nur der Owner darf Benutzer verwalten." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const uid = body?.uid;
    const action = body?.action as Action;

    if (typeof uid !== "string" || !ACTIONS.includes(action)) {
        return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }
    if (uid === session.uid) {
        return NextResponse.json({ error: "Du kannst dein eigenes Konto nicht ändern." }, { status: 400 });
    }

    const user = await adminAuth().getUser(uid).catch(() => null);
    if (!user) {
        return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });
    }
    if (user.customClaims?.owner === true) {
        return NextResponse.json({ error: "Owner-Konten können nicht geändert werden." }, { status: 400 });
    }

    if (action === "approve") {
        await adminAuth().setCustomUserClaims(uid, { ...(user.customClaims ?? {}), admin: true });
        await adminDb()
            .collection("pendingAdmins")
            .doc(uid)
            .set(
                { status: "approved", approvedAt: FieldValue.serverTimestamp(), approvedBy: session.email ?? session.uid },
                { merge: true },
            )
            .catch(() => {});
        return NextResponse.json({ ok: true });
    }

    if (action === "revoke") {
        await adminAuth().setCustomUserClaims(uid, { ...(user.customClaims ?? {}), admin: false });
        await adminAuth().revokeRefreshTokens(uid);
        return NextResponse.json({ ok: true });
    }

    if (action === "resetPassword") {
        if (!user.email) {
            return NextResponse.json({ error: "Benutzer hat keine E-Mail-Adresse." }, { status: 400 });
        }
        const link = await adminAuth().generatePasswordResetLink(user.email);
        const emailed = await sendPasswordReset(user.email, link).catch(() => false);
        // Wenn keine E-Mail versendet werden konnte, geben wir den Link an den Owner zurück.
        return NextResponse.json({ ok: true, emailed, link: emailed ? null : link });
    }

    // reject / delete: Konto entfernen
    await adminDb().collection("pendingAdmins").doc(uid).delete().catch(() => {});
    await adminAuth().deleteUser(uid).catch(() => {});
    return NextResponse.json({ ok: true });
}
