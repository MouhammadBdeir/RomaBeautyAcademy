// Editierbare E-Mail-Vorlagen + gemeinsames Rendering (Branding + Kontakt-Footer).
// Client-sicher: importiert nur Typen, keine Server-Module. Wird sowohl im
// Admin-Editor (Live-Vorschau) als auch serverseitig beim Versand verwendet.

import type { ContactData } from "@/lib/contact/types";

export const BRAND_NAME = "RomaBeautyAcademy";

export type EmailAudience = "customer" | "owner";

export type EmailTemplate = {
    subject: string;
    body: string; // Klartext mit {{platzhaltern}}; wird in das Branding-Layout eingebettet
    enabled: boolean;
};

export type EmailTemplateKey =
    | "bookingReceived"
    | "bookingConfirmed"
    | "bookingCancelled"
    | "bookingReminder"
    | "ownerNewBooking";

export type EmailTemplates = Record<EmailTemplateKey, EmailTemplate>;

export const TEMPLATE_KEYS: EmailTemplateKey[] = [
    "bookingReceived",
    "bookingConfirmed",
    "bookingCancelled",
    "bookingReminder",
    "ownerNewBooking",
];

// Felder, die in einer gebuchten Anfrage stecken (für den Versand & die Vorschau).
export type BookingEmailData = {
    name: string;
    email: string;
    phone: string;
    date: string; // YYYY-MM-DD
    time: string;
    message: string;
    service?: string;
    persons?: number;
};

const CUSTOMER_PH = [
    "name",
    "date",
    "time",
    "phone",
    "email",
    "service",
    "persons",
    "message",
    "studioName",
    "studioPhone",
    "studioEmail",
    "studioAddress",
];
const OWNER_PH = ["name", "email", "phone", "service", "persons", "date", "time", "message", "studioName", "bookingsUrl"];

export type TemplateMeta = {
    key: EmailTemplateKey;
    label: string;
    description: string;
    audience: EmailAudience;
    placeholders: string[];
};

export const TEMPLATE_META: TemplateMeta[] = [
    {
        key: "bookingReceived",
        label: "Terminanfrage erhalten",
        description: "Geht sofort an den Kunden, sobald er über /booking eine Anfrage abschickt.",
        audience: "customer",
        placeholders: CUSTOMER_PH,
    },
    {
        key: "bookingConfirmed",
        label: "Termin bestätigt",
        description: "Geht an den Kunden, sobald du eine Buchung bestätigst.",
        audience: "customer",
        placeholders: CUSTOMER_PH,
    },
    {
        key: "bookingCancelled",
        label: "Termin abgesagt",
        description: "Geht an den Kunden, sobald du eine Buchung absagst.",
        audience: "customer",
        placeholders: CUSTOMER_PH,
    },
    {
        key: "bookingReminder",
        label: "Termin-Erinnerung",
        description: "Geht automatisch einen Tag vor dem Termin an den Kunden – nur bei bestätigten Terminen.",
        audience: "customer",
        placeholders: CUSTOMER_PH,
    },
    {
        key: "ownerNewBooking",
        label: "Benachrichtigung ans Studio",
        description: "Interne Info an dich bei jeder neuen Terminanfrage.",
        audience: "owner",
        placeholders: OWNER_PH,
    },
];

export const PLACEHOLDER_LABELS: Record<string, string> = {
    name: "Name des Kunden",
    date: "Datum (TT.MM.JJJJ)",
    time: "Uhrzeit",
    phone: "Telefon des Kunden",
    email: "E-Mail des Kunden",
    message: "Nachricht des Kunden",
    service: "Gewünschter Service",
    persons: "Anzahl Personen",
    studioName: "Name des Studios",
    studioEmail: "E-Mail des Studios",
    studioPhone: "Telefon des Studios",
    studioAddress: "Adresse des Studios",
    bookingsUrl: "Link zur Buchungsverwaltung",
};

export const DEFAULT_TEMPLATES: EmailTemplates = {
    bookingReceived: {
        enabled: true,
        subject: "Wir haben deine Terminanfrage erhalten – {{studioName}}",
        body:
            "Hallo {{name}},\n\n" +
            "vielen Dank für deine Terminanfrage bei {{studioName}}!\n\n" +
            "Deine Anfrage im Überblick:\n" +
            "Datum: {{date}}\n" +
            "Uhrzeit: {{time}} Uhr\n\n" +
            "Wir prüfen deine Anfrage und melden uns in Kürze, um deinen Termin verbindlich zu bestätigen.\n\n" +
            "Hast du Fragen? Erreiche uns gern telefonisch unter {{studioPhone}} oder per E-Mail an {{studioEmail}}.\n\n" +
            "Liebe Grüße\nDein Team von {{studioName}}",
    },
    bookingConfirmed: {
        enabled: true,
        subject: "Dein Termin ist bestätigt – {{studioName}}",
        body:
            "Hallo {{name}},\n\n" +
            "gute Nachrichten – dein Termin bei {{studioName}} ist jetzt verbindlich bestätigt:\n\n" +
            "Datum: {{date}}\n" +
            "Uhrzeit: {{time}} Uhr\n\n" +
            "Wir freuen uns auf dich! Solltest du den Termin nicht wahrnehmen können, gib uns bitte rechtzeitig Bescheid.\n\n" +
            "Bis bald\nDein Team von {{studioName}}",
    },
    bookingCancelled: {
        enabled: true,
        subject: "Dein Termin wurde abgesagt – {{studioName}}",
        body:
            "Hallo {{name}},\n\n" +
            "leider müssen wir deinen Termin am {{date}} um {{time}} Uhr absagen.\n\n" +
            "Bitte entschuldige die Umstände. Für einen neuen Termin erreichst du uns unter {{studioPhone}} oder {{studioEmail}} – wir finden gern eine passende Alternative.\n\n" +
            "Liebe Grüße\nDein Team von {{studioName}}",
    },
    bookingReminder: {
        enabled: true,
        subject: "Erinnerung: Dein Termin morgen bei {{studioName}}",
        body:
            "Hallo {{name}},\n\n" +
            "wir möchten dich gern an deinen Termin bei {{studioName}} erinnern:\n\n" +
            "Datum: {{date}}\n" +
            "Uhrzeit: {{time}} Uhr\n\n" +
            "Wir freuen uns auf dich! Solltest du den Termin nicht wahrnehmen können, gib uns bitte rechtzeitig unter {{studioPhone}} Bescheid.\n\n" +
            "Bis morgen\nDein Team von {{studioName}}",
    },
    ownerNewBooking: {
        enabled: true,
        subject: "Neue Terminanfrage – {{date}} {{time}}",
        body:
            "Es ist eine neue Terminanfrage eingegangen:\n\n" +
            "Name: {{name}}\n" +
            "E-Mail: {{email}}\n" +
            "Telefon: {{phone}}\n" +
            "Service: {{service}}\n" +
            "Personen: {{persons}}\n" +
            "Datum: {{date}}\n" +
            "Uhrzeit: {{time}} Uhr\n" +
            "Nachricht: {{message}}\n\n" +
            "Verwalten: {{bookingsUrl}}",
    },
};

// Eingehende (evtl. unvollständige) Daten mit den Defaults zusammenführen.
export function mergeTemplates(raw: unknown): EmailTemplates {
    const x = (raw ?? {}) as Record<string, unknown>;
    const out = {} as EmailTemplates;
    for (const key of TEMPLATE_KEYS) {
        const o = (x[key] ?? {}) as Record<string, unknown>;
        const d = DEFAULT_TEMPLATES[key];
        out[key] = {
            subject: typeof o.subject === "string" ? o.subject : d.subject,
            body: typeof o.body === "string" ? o.body : d.body,
            enabled: typeof o.enabled === "boolean" ? o.enabled : d.enabled,
        };
    }
    return out;
}

export function formatGermanDate(dateKey: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
    return m ? `${m[3]}.${m[2]}.${m[1]}` : dateKey;
}

export function applyVars(text: string, vars: Record<string, string>): string {
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => (k in vars ? vars[k] : `{{${k}}}`));
}

export function buildBookingVars(
    b: BookingEmailData,
    contact: ContactData,
    siteUrl = "",
): Record<string, string> {
    const address = [contact.street, [contact.zip, contact.city].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ");
    return {
        name: b.name || "",
        date: formatGermanDate(b.date),
        time: b.time || "",
        phone: b.phone || "",
        email: b.email || "",
        service: b.service?.trim() || "—",
        persons: b.persons ? String(b.persons) : "1",
        message: b.message?.trim() || "—",
        studioName: BRAND_NAME,
        studioEmail: contact.email || "",
        studioPhone: contact.phone || "",
        studioAddress: address,
        bookingsUrl: `${siteUrl}/admin/bookings`,
    };
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function inlineFormat(s: string): string {
    return escapeHtml(s)
        .replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" style="color:#C8A24A; text-decoration:underline">$1</a>',
        )
        .replace(/\n/g, "<br>");
}

function bodyToHtml(text: string): string {
    return text
        .split(/\n{2,}/)
        .map((p) => `<p style="margin:0 0 16px">${inlineFormat(p)}</p>`)
        .join("");
}

function footerHtml(contact: ContactData): string {
    const addr = [contact.street, [contact.zip, contact.city].filter(Boolean).join(" "), contact.country]
        .filter(Boolean)
        .join(" · ");
    const rows: string[] = [
        `<div style="font-weight:700; letter-spacing:0.22em; font-size:13px; color:#0B0B0B">` +
            `<span style="color:#C8A24A">ROMABEAUTY</span>ACADEMY</div>`,
    ];
    if (addr) rows.push(`<div style="margin-top:6px">${escapeHtml(addr)}</div>`);

    const bits: string[] = [];
    if (contact.phone) bits.push(`Tel: ${escapeHtml(contact.phone)}`);
    if (contact.email)
        bits.push(`<a href="mailto:${escapeHtml(contact.email)}" style="color:#7a756c">${escapeHtml(contact.email)}</a>`);
    if (bits.length) rows.push(`<div style="margin-top:4px">${bits.join(" · ")}</div>`);

    const social = (contact.social ?? [])
        .filter((s) => s.url)
        .map(
            (s) =>
                `<a href="${escapeHtml(s.url)}" style="color:#C8A24A; text-decoration:none">${escapeHtml(s.label || s.url)}</a>`,
        )
        .join(" · ");
    if (social) rows.push(`<div style="margin-top:8px">${social}</div>`);

    return rows.join("");
}

/** Branded HTML-E-Mail um den (bereits ersetzten) Klartext herum. */
export function renderEmailHtml(bodyText: string, contact: ContactData): string {
    return (
        `<!doctype html><html lang="de"><head><meta charset="utf-8">` +
        `<meta name="viewport" content="width=device-width, initial-scale=1"></head>` +
        `<body style="margin:0; padding:0; background:#F7F3EE; font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#0B0B0B">` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EE">` +
        `<tr><td align="center" style="padding:32px 16px">` +
        `<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:100%; background:#ffffff; border:1px solid rgba(0,0,0,0.06); border-radius:18px; overflow:hidden">` +
        `<tr><td style="padding:26px 32px; border-bottom:1px solid #f0ece4">` +
        `<span style="letter-spacing:0.25em; font-weight:700; font-size:14px; color:#0B0B0B"><span style="color:#C8A24A">RomaBeauty</span>Academy</span>` +
        `</td></tr>` +
        `<tr><td style="padding:30px 32px; font-size:15px; line-height:1.7; color:#0B0B0B">${bodyToHtml(bodyText)}</td></tr>` +
        `<tr><td style="padding:22px 32px; background:#FAF7F2; border-top:1px solid #f0ece4; font-size:12px; line-height:1.6; color:#7a756c">${footerHtml(contact)}</td></tr>` +
        `</table>` +
        `<div style="font-size:11px; color:#b3ada3; margin-top:16px">Diese E-Mail wurde automatisch versendet.</div>` +
        `</td></tr></table></body></html>`
    );
}

/** Klartext-Variante (Fallback für E-Mail-Clients ohne HTML). */
export function renderEmailText(bodyText: string, contact: ContactData): string {
    const addr = [contact.street, [contact.zip, contact.city].filter(Boolean).join(" "), contact.country]
        .filter(Boolean)
        .join(", ");
    const lines = [bodyText, "", "—", BRAND_NAME];
    if (addr) lines.push(addr);
    if (contact.phone) lines.push(`Tel: ${contact.phone}`);
    if (contact.email) lines.push(contact.email);
    return lines.join("\n");
}

export function renderTemplate(
    t: EmailTemplate,
    vars: Record<string, string>,
    contact: ContactData,
): { subject: string; text: string; html: string } {
    const bodyText = applyVars(t.body, vars);
    return {
        subject: applyVars(t.subject, vars),
        text: renderEmailText(bodyText, contact),
        html: renderEmailHtml(bodyText, contact),
    };
}
