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
    status: BookingStatus;
    createdAt: string | null;
};

export function toDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export type DayState = { closed: boolean; reason: string | null };

/** Geschlossen an Sonntagen und Feiertagen. Samstag = Arbeitstag. */
export function dayState(d: Date, holidays: Record<string, string>): DayState {
    if (d.getDay() === 0) return { closed: true, reason: "Sonntag (geschlossen)" };
    const name = holidays[toDateKey(d)];
    if (name) return { closed: true, reason: name };
    return { closed: false, reason: null };
}

export const STATUS_LABEL: Record<BookingStatus, string> = {
    pending: "Offen",
    confirmed: "Bestätigt",
    cancelled: "Abgesagt",
};
