// Protokoll zurücksetzen anfragen. Nur Admin – geleert wird erst nach
// Bestätigung des Owners per E-Mail (analog zu den Einstellungen).
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";
import { sendOwnerEmail } from "@/lib/email/server";
import { addLog } from "@/lib/logs/server";

export async function POST() {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const token = `${randomUUID()}${randomUUID()}`.replace(/-/g, "");
    const link = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/admin/logs/reset/confirm?token=${token}`;

    await adminDb()
        .collection("config")
        .doc("logsResetPending")
        .set({
            token,
            requestedBy: session.email ?? session.uid,
            createdAt: FieldValue.serverTimestamp(),
        });

    const text =
        `Hallo,\n\n` +
        `für RomaBeautyAcademy wurde das Zurücksetzen des Protokolls angefragt` +
        (session.email ? ` von ${session.email}` : "") +
        `.\n\n` +
        `Achtung: Dabei werden ALLE Protokoll-Einträge unwiderruflich gelöscht.\n\n` +
        `Zum Bestätigen bitte diesen Link öffnen:\n${link}\n\n` +
        `Wenn du das nicht warst, ignoriere diese E-Mail – das Protokoll bleibt dann unverändert.`;

    const sent = await sendOwnerEmail("Protokoll zurücksetzen – RomaBeautyAcademy", text);
    if (!sent) {
        await adminDb().collection("config").doc("logsResetPending").delete().catch(() => {});
        return NextResponse.json(
            {
                error: "Bestätigungs-E-Mail konnte nicht gesendet werden (SMTP bzw. ADMIN_OWNER_EMAIL prüfen). Das Protokoll wurde nicht geleert.",
            },
            { status: 500 },
        );
    }

    await addLog({
        category: "admin",
        message: "Protokoll-Zurücksetzen angefragt – wartet auf Bestätigung des Owners",
        actor: session.email ?? session.uid,
    });

    return NextResponse.json({ ok: true, pending: true });
}
