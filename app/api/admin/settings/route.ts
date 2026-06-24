// Einstellungen ändern. Nur Admin – und erst nach Bestätigung des Owners per E-Mail.
// Beim Speichern wird die Änderung als "pending" abgelegt und ein Bestätigungs-Link
// an ADMIN_OWNER_EMAIL geschickt. Übernommen wird sie erst über /api/admin/settings/confirm.
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";
import { mergeSettings } from "@/lib/settings/types";
import { sendOwnerEmail } from "@/lib/email/server";
import { addLog } from "@/lib/logs/server";

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    const clean = mergeSettings(body);
    // Wartungsmodus läuft separat & sofort (siehe /api/admin/maintenance) – hier
    // bewusst NICHT mitspeichern, damit die Bestätigung ihn nicht überschreibt.
    const pendingSettings = {
        maxAccounts: clean.maxAccounts,
        blockSaturdays: clean.blockSaturdays,
        vacations: clean.vacations,
        ccEmails: clean.ccEmails,
        language: clean.language,
    };
    const token = `${randomUUID()}${randomUUID()}`.replace(/-/g, "");
    const link = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/admin/settings/confirm?token=${token}`;

    await adminDb()
        .collection("config")
        .doc("settingsPending")
        .set({
            settings: pendingSettings,
            token,
            requestedBy: session.email ?? session.uid,
            createdAt: FieldValue.serverTimestamp(),
        });

    const text =
        `Hallo,\n\n` +
        `für RomaBeautyAcademy wurde eine Änderung der Einstellungen angefragt` +
        (session.email ? ` von ${session.email}` : "") +
        `.\n\n` +
        `Zum Bestätigen und Übernehmen bitte diesen Link öffnen:\n${link}\n\n` +
        `Wenn du das nicht warst, ignoriere diese E-Mail – die Änderung wird dann nicht übernommen.`;

    const sent = await sendOwnerEmail("Einstellungen bestätigen – RomaBeautyAcademy", text);
    if (!sent) {
        await adminDb().collection("config").doc("settingsPending").delete().catch(() => {});
        return NextResponse.json(
            {
                error: "Bestätigungs-E-Mail konnte nicht gesendet werden (SMTP bzw. ADMIN_OWNER_EMAIL prüfen). Die Änderung wurde nicht übernommen.",
            },
            { status: 500 },
        );
    }

    await addLog({
        category: "admin",
        message: "Einstellungs-Änderung angefragt – wartet auf Bestätigung des Owners",
        actor: session.email ?? session.uid,
    });

    return NextResponse.json({ ok: true, pending: true });
}
