// Registrierung: legt eine Freigabe-Anfrage (pendingAdmins) an.
// Der Auth-Benutzer wird bereits client-seitig erstellt; hier wird nur
// die Anfrage dokumentiert und der Owner benachrichtigt.
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { notifyOwnerOfRegistration } from "@/lib/email";

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

    return NextResponse.json({ ok: true, status: "pending" });
}
