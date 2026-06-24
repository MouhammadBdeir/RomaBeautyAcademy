// Protokoll-Einträge (Admin-Logs). Client-sicher.

export type LogCategory = "booking" | "admin" | "email" | "system";
export type LogLevel = "info" | "warn" | "error";

export type LogEntry = {
    id: string;
    category: LogCategory;
    level: LogLevel;
    message: string;
    actor: string | null; // wer die Aktion ausgelöst hat (E-Mail / "Kunde" / "System")
    createdAt: string | null; // formatiert (TT.MM.JJJJ HH:MM)
};

export const CATEGORY_LABEL: Record<LogCategory, string> = {
    booking: "Buchung",
    admin: "Admin",
    email: "E-Mail",
    system: "System",
};
