// Deutsche Feiertage über die kostenlose Nager.Date API (kein API-Key nötig).
// Wird serverseitig aufgerufen; das Ergebnis wird an den Client weitergereicht.

type NagerHoliday = {
    date: string; // YYYY-MM-DD
    localName: string;
    name: string;
    global: boolean;
    counties: string[] | null;
};

/**
 * Liefert eine Map "YYYY-MM-DD" -> Feiertagsname für die angegebenen Jahre.
 * Standard: bundesweite Feiertage. Optional ein Bundesland via HOLIDAY_STATE
 * (z. B. "DE-NW" für Nordrhein-Westfalen) ergänzt landesspezifische Tage.
 */
export async function getGermanHolidays(years: number[]): Promise<Record<string, string>> {
    const out: Record<string, string> = {};
    const state = process.env.HOLIDAY_STATE;

    for (const year of years) {
        try {
            const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/DE`, {
                next: { revalidate: 60 * 60 * 24 }, // 1x täglich
            });
            if (!res.ok) continue;
            const data = (await res.json()) as NagerHoliday[];
            for (const h of data) {
                const applies = h.global || (!!state && !!h.counties?.includes(state));
                if (applies) out[h.date] = h.localName;
            }
        } catch {
            // API nicht erreichbar -> es werden keine Feiertage blockiert.
        }
    }

    return out;
}
