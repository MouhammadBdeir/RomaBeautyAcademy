// Buchungen verwalten (nur Admin): Status setzen oder löschen.
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";

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

    await adminDb().collection("bookings").doc(id).set(update, { merge: true });
    return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "id fehlt." }, { status: 400 });
    }

    await adminDb().collection("bookings").doc(id).delete();
    return NextResponse.json({ ok: true });
}
