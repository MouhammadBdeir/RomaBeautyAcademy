// Benachrichtigungen fürs Admin-Dashboard. Client-sicher (keine Server-Imports).
// Eine Benachrichtigung gehört zu genau einer Buchung, hat aber ihren eigenen
// Lebenszyklus (gelesen / archiviert / gelöscht) – unabhängig von der Buchung.
import type { BookingStatus } from "@/lib/bookings/types";

export type AdminNotification = {
    id: string;
    bookingId: string;
    name: string;
    date: string; // YYYY-MM-DD
    time: string;
    status: BookingStatus;
    read: boolean;
    archived: boolean;
    createdAt: string | null; // bereits formatiert (TT.MM. HH:MM)
};
