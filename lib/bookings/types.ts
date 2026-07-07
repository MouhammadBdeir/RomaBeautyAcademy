// Client-sichere Typen & Datums-Helfer für Buchungen.

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
    id: string;
    name: string;
    email: string;
    phone: string;
    date: string; // YYYY-MM-DD
    time: string;
    message: string;
    service: string; // gewünschter Service (optional vom Kunden)
    persons: number; // Anzahl Personen (Standard 1)
    status: BookingStatus;
    createdAt: string | null;
    reminderSentAt: string | null; // formatiert, wenn die Erinnerung verschickt wurde
};

export function toDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export type DayState = { closed: boolean; reason: string | null };

// Tages-Status (Sonntag/Samstag/Feiertag/Urlaub) wird schaltbar in
// bookingDayState() in lib/settings/types.ts berechnet.

export const STATUS_LABEL: Record<BookingStatus, string> = {
    pending: "Offen",
    confirmed: "Bestätigt",
    cancelled: "Abgesagt",
};
