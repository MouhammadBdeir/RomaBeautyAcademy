// Server-seitige Logik für Benachrichtigungen (Admin-SDK).
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { BookingStatus } from "@/lib/bookings/types";
import type { AdminNotification } from "./types";

function fmtTs(ts: unknown): string | null {
    try {
        const maybe = ts as { toDate?: () => Date } | null;
        const d = maybe && typeof maybe.toDate === "function" ? maybe.toDate() : null;
        if (!d) return null;
        const dd = String(d.getUTCDate()).padStart(2, "0");
        const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
        const hh = String(d.getUTCHours()).padStart(2, "0");
        const mi = String(d.getUTCMinutes()).padStart(2, "0");
        return `${dd}.${mm}. ${hh}:${mi}`;
    } catch {
        return null;
    }
}

const col = () => adminDb().collection("notifications");

/** Beim Anlegen einer Buchung eine Benachrichtigung erzeugen. */
export async function createBookingNotification(
    bookingId: string,
    data: { name: string; date: string; time: string },
): Promise<void> {
    await col().add({
        bookingId,
        name: data.name,
        date: data.date,
        time: data.time,
        status: "pending" as BookingStatus,
        read: false,
        archived: false,
        createdAt: FieldValue.serverTimestamp(),
    });
}

export async function getNotifications(includeArchived = false): Promise<AdminNotification[]> {
    try {
        const snap = await col().orderBy("createdAt", "desc").get();
        const list = snap.docs.map((doc) => {
            const x = doc.data();
            return {
                id: doc.id,
                bookingId: (x.bookingId as string) ?? "",
                name: (x.name as string) ?? "",
                date: (x.date as string) ?? "",
                time: (x.time as string) ?? "",
                status: (x.status as BookingStatus) ?? "pending",
                read: x.read === true,
                archived: x.archived === true,
                createdAt: fmtTs(x.createdAt),
            };
        });
        return includeArchived ? list : list.filter((n) => !n.archived);
    } catch {
        return [];
    }
}

/** Status/Termin der Benachrichtigung(en) einer Buchung nachziehen. */
export async function syncNotificationForBooking(
    bookingId: string,
    patch: { status?: BookingStatus; date?: string; time?: string },
): Promise<void> {
    const clean: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (patch.status) clean.status = patch.status;
    if (patch.date) clean.date = patch.date;
    if (patch.time) clean.time = patch.time;

    const snap = await col().where("bookingId", "==", bookingId).get();
    await Promise.all(snap.docs.map((d) => d.ref.set(clean, { merge: true })));
}

/** Beim Löschen einer Buchung: zugehörige Benachrichtigung löschen oder archivieren. */
export async function disposeNotificationForBooking(
    bookingId: string,
    mode: "archive" | "delete",
): Promise<void> {
    const snap = await col().where("bookingId", "==", bookingId).get();
    await Promise.all(
        snap.docs.map((d) =>
            mode === "delete"
                ? d.ref.delete()
                : d.ref.set({ archived: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
        ),
    );
}
