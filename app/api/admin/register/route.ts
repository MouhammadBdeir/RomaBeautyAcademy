// Registrierung: legt eine Freigabe-Anfrage (pendingAdmins) an.
// Der Auth-Benutzer wird bereits client-seitig erstellt; hier wird nur
// die Anfrage dokumentiert und der Owner benachrichtigt.
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { notifyOwnerOfRegistration } from "@/lib/email";
import { getSettings } from "@/lib/settings/server";
import { addLog } from "@/lib/logs/server";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const idToken = body?.idToken;

    if (!idToken || typeof idToken !== "string") {
        return NextResponse.json({ error: "idToken fehlt." }, { status: 400 });
    }

    let decoded;
    try {
        decoded = await adminAuth().verifyIdToken(idToken);
    } catch {
        return NextResponse.json({ error: "Ungültiges Token." }, { status: 401 });
    }

    // Schon freigegeben? Dann ist nichts zu tun.
    if (decoded.admin === true) {
        return NextResponse.json({ ok: true, status: "already-admin" });
    }

    // Konten-Limit aus den Einstellungen (der neue Auth-Benutzer ist hier schon mitgezählt).
    const settings = await getSettings();
    if (settings.maxAccounts > 0) {
        const all = await adminAuth().listUsers(1000);
        if (all.users.length > settings.maxAccounts) {
            await adminAuth().deleteUser(decoded.uid).catch(() => {});
            return NextResponse.json(
                { error: "Registrierung derzeit nicht möglich – die maximale Anzahl an Konten ist erreicht." },
                { status: 403 },
            );
        }
    }

    await adminDb().collection("pendingAdmins").doc(decoded.uid).set(
        {
            uid: decoded.uid,
            email: decoded.email ?? null,
            status: "pending",
            requestedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
    );

    // E-Mail ist best-effort und darf den Flow nicht blockieren.
    await notifyOwnerOfRegistration(decoded.email ?? "(unbekannt)").catch(() => {});
    await addLog({
        category: "admin",
        message: `Neue Registrierung: ${decoded.email ?? "(unbekannt)"}`,
        actor: decoded.email ?? null,
    });

    return NextResponse.json({ ok: true, status: "pending" });
}
