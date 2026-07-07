// Wartungsmodus sofort an/aus schalten. Nur Admin – ohne E-Mail-Bestätigung,
// damit man die Seite im Notfall direkt offline nehmen kann.
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";
import { addLog } from "@/lib/logs/server";
import { sendOwnerEmail } from "@/lib/email/server";

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const on = body?.on === true;

    await adminDb().collection("config").doc("settings").set({ maintenanceMode: on }, { merge: true });
    await addLog({
        category: "admin",
        message: `Wartungsmodus ${on ? "aktiviert" : "deaktiviert"}`,
        actor: session.email ?? session.uid,
    });

    // Owner best-effort informieren (blockiert nicht).
    await sendOwnerEmail(
        `Wartungsmodus ${on ? "AN" : "AUS"} – RomaBeautyAcademy`,
        `Der Wartungsmodus wurde ${on ? "aktiviert" : "deaktiviert"}${session.email ? ` von ${session.email}` : ""}.`,
    ).catch(() => {});

    return NextResponse.json({ ok: true, maintenanceMode: on });
}
