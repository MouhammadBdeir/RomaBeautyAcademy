// Server-seitiges Lesen der Einstellungen + Wartungsmodus-Guard (Admin-SDK).
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { mergeSettings, type SiteSettings } from "./types";

export async function getSettings(): Promise<SiteSettings> {
    try {
        const snap = await adminDb().collection("config").doc("settings").get();
        return mergeSettings(snap.data());
    } catch {
        return mergeSettings(null);
    }
}

/**
 * In öffentlichen Server-Komponenten aufrufen. Ist der Wartungsmodus aktiv,
 * werden ALLE Besucher auf /maintenance umgeleitet (auch Admins – Verwaltung
 * läuft weiter über /admin). force-dynamic sorgt dafür, dass das sofort greift.
 */
export async function guardMaintenance(): Promise<void> {
    const settings = await getSettings();
    if (settings.maintenanceMode) redirect("/maintenance");
}
