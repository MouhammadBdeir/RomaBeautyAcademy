// Tägliche Termin-Erinnerungen: einen Tag vor bestätigten Terminen.
// Wird per Vercel Cron aufgerufen (siehe vercel.json). Mit CRON_SECRET absichern:
// Vercel sendet dann automatisch den Header "Authorization: Bearer <CRON_SECRET>".
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { sendBookingReminder } from "@/lib/email/server";

export const dynamic = "force-dynamic";

function tomorrowKeyUTC(): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 1);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

const str = (v: unknown): string => (typeof v === "string" ? v : "");

export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const tomorrow = tomorrowKeyUTC();
    let sent = 0;
    try {
        const snap = await adminDb().collection("bookings").where("date", "==", tomorrow).get();
        for (const doc of snap.docs) {
            const b = doc.data();
            if (b.status !== "confirmed" || b.reminderSentAt) continue;
            await sendBookingReminder({
                name: str(b.name),
                email: str(b.email),
                phone: str(b.phone),
                date: str(b.date),
                time: str(b.time),
                message: str(b.message),
            });
            await doc.ref.set({ reminderSentAt: FieldValue.serverTimestamp() }, { merge: true });
            sent++;
        }
    } catch {
        return NextResponse.json({ error: "Fehler beim Senden der Erinnerungen." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, date: tomorrow, sent });
}
