// Globale Seiten-Einstellungen (Admin). Client-sicher.
import { toDateKey, type DayState } from "@/lib/bookings/types";

export type Vacation = {
    id: string;
    from: string; // YYYY-MM-DD
    to: string; // YYYY-MM-DD (inkl.)
    label: string;
};

export type SiteSettings = {
    maxAccounts: number; // 0 = unbegrenzt
    blockSaturdays: boolean;
    blockSundays: boolean;
    blockHolidays: boolean;
    vacations: Vacation[];
    maintenanceMode: boolean;
    ccEmails: string[]; // zusätzliche Empfänger der Buchungs-Benachrichtigung
    language: "de"; // vorerst fest
};

export const DEFAULT_SETTINGS: SiteSettings = {
    maxAccounts: 0,
    blockSaturdays: false,
    blockSundays: true,
    blockHolidays: true,
    vacations: [],
    maintenanceMode: false,
    ccEmails: [],
    language: "de",
};

function str(v: unknown): string {
    return typeof v === "string" ? v.trim() : "";
}

export function mergeSettings(raw: unknown): SiteSettings {
    const x = (raw ?? {}) as Record<string, unknown>;

    const vacations: Vacation[] = Array.isArray(x.vacations)
        ? (x.vacations as unknown[])
              .map((v, i) => {
                  const o = (v ?? {}) as Record<string, unknown>;
                  return {
                      id: str(o.id) || String(i),
                      from: str(o.from),
                      to: str(o.to) || str(o.from),
                      label: str(o.label),
                  };
              })
              .filter((v) => v.from)
        : [];

    const ccEmails = Array.isArray(x.ccEmails)
        ? (x.ccEmails as unknown[]).map((e) => str(e)).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
        : [];

    const maxAccounts =
        typeof x.maxAccounts === "number" && x.maxAccounts >= 0 ? Math.floor(x.maxAccounts) : 0;

    return {
        maxAccounts,
        blockSaturdays: x.blockSaturdays === true,
        // Standard: gesperrt (bisheriges Verhalten). Nur ein ausdrückliches false öffnet den Tag.
        blockSundays: x.blockSundays !== false,
        blockHolidays: x.blockHolidays !== false,
        vacations,
        maintenanceMode: x.maintenanceMode === true,
        ccEmails,
        language: "de",
    };
}

/** Liegt das Datum in einem eingetragenen Urlaub? Gibt das Label zurück oder null. */
export function vacationLabel(dateKey: string, vacations: Vacation[]): string | null {
    for (const v of vacations) {
        if (v.from && v.to && dateKey >= v.from && dateKey <= v.to) return v.label || "Urlaub";
    }
    return null;
}

/**
 * Tages-Status für die öffentliche Buchung. Jede Sperre ist über die
 * Einstellungen einzeln schaltbar: Sonntage, Samstage, Feiertage – dazu die
 * eingetragenen Urlaubstage.
 */
export function bookingDayState(
    d: Date,
    holidays: Record<string, string>,
    settings: Pick<SiteSettings, "blockSaturdays" | "blockSundays" | "blockHolidays" | "vacations">,
): DayState {
    if (settings.blockSundays && d.getDay() === 0) {
        return { closed: true, reason: "Sonntag (geschlossen)" };
    }
    if (settings.blockSaturdays && d.getDay() === 6) {
        return { closed: true, reason: "Samstag – geschlossen" };
    }
    if (settings.blockHolidays) {
        const name = holidays[toDateKey(d)];
        if (name) return { closed: true, reason: name };
    }
    const vac = vacationLabel(toDateKey(d), settings.vacations);
    if (vac) return { closed: true, reason: vac };
    return { closed: false, reason: null };
}
