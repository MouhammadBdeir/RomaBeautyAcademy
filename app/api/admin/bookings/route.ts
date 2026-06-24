// Buchungen verwalten (nur Admin): Status setzen oder löschen.
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";
import type { BookingStatus } from "@/lib/bookings/types";
import { sendBookingConfirmed, sendBookingCancelled, sendBookingReminder } from "@/lib/email/server";
import { syncNotificationForBooking, disposeNotificationForBooking } from "@/lib/notifications/server";
import { addLog } from "@/lib/logs/server";

const str = (v: unknown): string => (typeof v === "string" ? v : "");

const STATUSES = ["pending", "confirmed", "cancelled"] as const;
const isDateKey = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

function todayKeyUTC(): string {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const id = body?.id;
    if (typeof id !== "string") {
        return NextResponse.json({ error: "id fehlt." }, { status: 400 });
    }

    // Erinnerung manuell senden ("jetzt schicken"-Button).
    if (body?.action === "sendReminder") {
        const ref = adminDb().collection("bookings").doc(id);
        const b = (await ref.get()).data();
        if (!b) {
            return NextResponse.json({ error: "Buchung nicht gefunden." }, { status: 404 });
        }
        if (b.status !== "confirmed") {
            return NextResponse.json(
                { error: "Erinnerungen gibt es nur für bestätigte Termine." },
                { status: 400 },
            );
        }
        await sendBookingReminder({
            name: str(b.name),
            email: str(b.email),
            phone: str(b.phone),
            date: str(b.date),
            time: str(b.time),
            message: str(b.message),
            service: str(b.service),
            persons: typeof b.persons === "number" ? b.persons : 1,
        });
        await ref.set({ reminderSentAt: FieldValue.serverTimestamp() }, { merge: true });
        await addLog({
            category: "booking",
            message: `Erinnerung gesendet an ${str(b.name)} (${str(b.date)} ${str(b.time)})`,
            actor: session.email ?? session.uid,
        });
        return NextResponse.json({ ok: true });
    }

    const update: Record<string, unknown> = {
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: session.email ?? session.uid,
    };

    // Status ändern (bestätigen/absagen/reaktivieren)
    if (body?.status !== undefined) {
        if (!STATUSES.includes(body.status)) {
            return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
        }
        update.status = body.status;
    }

    // Termin verschieben (neues Datum/Uhrzeit). Admin darf auch auf
    // Sonn-/Feiertage legen – nur Vergangenheit ist gesperrt.
    const wantsReschedule = body?.date !== undefined || body?.time !== undefined;
    if (wantsReschedule) {
        if (!isDateKey(body?.date)) {
            return NextResponse.json({ error: "Ungültiges Datum." }, { status: 400 });
        }
        if (typeof body?.time !== "string" || !body.time.trim()) {
            return NextResponse.json({ error: "Bitte eine Uhrzeit angeben." }, { status: 400 });
        }
        if (body.date < todayKeyUTC()) {
            return NextResponse.json({ error: "Das Datum liegt in der Vergangenheit." }, { status: 400 });
        }
        update.date = body.date;
        update.time = body.time.trim().slice(0, 20);
    }

    if (!("status" in update) && !wantsReschedule) {
        return NextResponse.json({ error: "Nichts zu ändern." }, { status: 400 });
    }

    const ref = adminDb().collection("bookings").doc(id);
    const cur = (await ref.get()).data() ?? {};
    await ref.set(update, { merge: true });

    // Benachrichtigung im Dashboard nachziehen (Status/Termin).
    await syncNotificationForBooking(id, {
        status: update.status as BookingStatus | undefined,
        date: update.date as string | undefined,
        time: update.time as string | undefined,
    }).catch(() => {});

    // Beim Bestätigen: Benachrichtigung wie gewählt archivieren oder löschen.
    if (body?.notification === "archive" || body?.notification === "delete") {
        await disposeNotificationForBooking(id, body.notification).catch(() => {});
    }

    // Status-Mail an den Kunden – nur, wenn sich der Status wirklich geändert hat.
    const newStatus = update.status as string | undefined;
    if (newStatus && newStatus !== cur.status) {
        const mailData = {
            name: str(cur.name),
            email: str(cur.email),
            phone: str(cur.phone),
            date: str(update.date) || str(cur.date),
            time: str(update.time) || str(cur.time),
            message: str(cur.message),
            service: str(cur.service),
            persons: typeof cur.persons === "number" ? cur.persons : 1,
        };
        if (newStatus === "confirmed") await sendBookingConfirmed(mailData);
        else if (newStatus === "cancelled") await sendBookingCancelled(mailData);
    }

    await addLog({
        category: "booking",
        message: `Buchung von ${str(cur.name)} aktualisiert${newStatus ? ` → ${newStatus}` : ""}${wantsReschedule ? ` (Termin ${str(update.date)} ${str(update.time)})` : ""}`,
        actor: session.email ?? session.uid,
    });

    return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "id fehlt." }, { status: 400 });
    }

    // Benachrichtigung archivieren (Standard) oder mitlöschen.
    const mode = url.searchParams.get("notification") === "delete" ? "delete" : "archive";

    const delName = ((await adminDb().collection("bookings").doc(id).get()).data()?.name as string) ?? id;
    await adminDb().collection("bookings").doc(id).delete();
    await disposeNotificationForBooking(id, mode).catch(() => {});
    await addLog({
        category: "booking",
        level: "warn",
        message: `Buchung gelöscht: ${delName}`,
        actor: session.email ?? session.uid,
    });
    return NextResponse.json({ ok: true });
}
