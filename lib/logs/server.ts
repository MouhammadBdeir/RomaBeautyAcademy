// Server-seitiges Protokoll (Admin-SDK). Schreiben ist best-effort und wirft nie.
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { LogCategory, LogEntry, LogLevel } from "./types";

function fmtTs(ts: unknown): string | null {
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

export async function addLog(entry: {
    category: LogCategory;
    message: string;
    actor?: string | null;
    level?: LogLevel;
}): Promise<void> {
    try {
        await adminDb()
            .collection("logs")
            .add({
                category: entry.category,
                level: entry.level ?? "info",
                message: entry.message.slice(0, 500),
                actor: entry.actor ?? null,
                createdAt: FieldValue.serverTimestamp(),
            });
    } catch {
        /* Protokoll darf den eigentlichen Vorgang nie blockieren */
    }
}

export async function getLogs(limitN = 100): Promise<LogEntry[]> {
    try {
        const snap = await adminDb().collection("logs").orderBy("createdAt", "desc").limit(limitN).get();
        return snap.docs.map((doc) => {
            const x = doc.data();
            return {
                id: doc.id,
                category: (x.category as LogCategory) ?? "system",
                level: (x.level as LogLevel) ?? "info",
                message: (x.message as string) ?? "",
                actor: (x.actor as string) ?? null,
                createdAt: fmtTs(x.createdAt),
            };
        });
    } catch {
        return [];
    }
}
