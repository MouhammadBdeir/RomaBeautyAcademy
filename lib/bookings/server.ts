// Server-seitige Buchungs-Lesefunktion (Admin-SDK).
import { adminDb } from "@/lib/firebase/admin";
import type { Booking, BookingStatus } from "./types";

function fmtTimestamp(ts: unknown): string | null {
    try {
        const maybe = ts as { toDate?: () => Date } | null;
        const d = maybe && typeof maybe.toDate === "function" ? maybe.toDate() : null;
        if (!d) return null;
        const dd = String(d.getUTCDate()).padStart(2, "0");
        const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
        const hh = String(d.getUTCHours()).padStart(2, "0");
        const mi = String(d.getUTCMinutes()).padStart(2, "0");
        return `${dd}.${mm}.${d.getUTCFullYear()} ${hh}:${mi}`;
    } catch {
        return null;
    }
}

export async function getBookings(): Promise<Booking[]> {
    try {
        const snap = await adminDb().collection("bookings").orderBy("date", "asc").get();
        return snap.docs.map((doc) => {
            const x = doc.data();
            return {
                id: doc.id,
                name: (x.name as string) ?? "",
                email: (x.email as string) ?? "",
                phone: (x.phone as string) ?? "",
                date: (x.date as string) ?? "",
                time: (x.time as string) ?? "",
                message: (x.message as string) ?? "",
                status: (x.status as BookingStatus) ?? "pending",
                createdAt: fmtTimestamp(x.createdAt),
            };
        });
    } catch {
        return [];
    }
}
