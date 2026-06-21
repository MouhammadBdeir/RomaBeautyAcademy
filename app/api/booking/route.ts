// Öffentliche Terminanfrage. Validiert serverseitig (Vergangenheit/Sonntag/
// Feiertag) und legt die Buchung über das Admin-SDK an.
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getGermanHolidays } from "@/lib/holidays";
import { dayState } from "@/lib/bookings/types";
import { notifyOwnerOfBooking } from "@/lib/email";

const isDateKey = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isEmail = (s: unknown): s is string => typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

function todayKeyUTC(): string {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);

    // Honeypot: ausgefülltes (für Menschen unsichtbares) Feld -> Bot. Still verwerfen.
    if (typeof body?.website === "string" && body.website.trim() !== "") {
        return NextResponse.json({ ok: true });
    }

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim().slice(0, 60) : "";
    const time = typeof body?.time === "string" ? body.time.trim().slice(0, 20) : "";
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 1000) : "";
    const date = body?.date;

    if (!name || name.length > 120) {
        return NextResponse.json({ error: "Bitte einen gültigen Namen angeben." }, { status: 400 });
    }
    if (!isEmail(email)) {
        return NextResponse.json({ error: "Bitte eine gültige E-Mail-Adresse angeben." }, { status: 400 });
    }
    if (!isDateKey(date)) {
        return NextResponse.json({ error: "Bitte ein Datum wählen." }, { status: 400 });
    }
    if (!time) {
        return NextResponse.json({ error: "Bitte eine Uhrzeit wählen." }, { status: 400 });
    }
    if (!phone) {
        return NextResponse.json({ error: "Bitte eine Telefonnummer angeben." }, { status: 400 });
    }
    if (body?.privacyConsent !== true) {
        return NextResponse.json({ error: "Bitte die Datenschutzerklärung bestätigen." }, { status: 400 });
    }
    if (date < todayKeyUTC()) {
        return NextResponse.json({ error: "Das gewählte Datum liegt in der Vergangenheit." }, { status: 400 });
    }

    const [y, m, d] = date.split("-").map(Number);
    const holidays = await getGermanHolidays([y]);
    const state = dayState(new Date(y, m - 1, d), holidays);
    if (state.closed) {
        return NextResponse.json(
            { error: `An diesem Tag ist keine Buchung möglich (${state.reason}).` },
            { status: 400 },
        );
    }

    await adminDb().collection("bookings").add({
        name,
        email,
        phone,
        date,
        time,
        message,
        status: "pending",
        privacyConsent: true,
        createdAt: FieldValue.serverTimestamp(),
    });

    await notifyOwnerOfBooking({ name, email, date, time }).catch(() => {});

    return NextResponse.json({ ok: true });
}
