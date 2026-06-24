// Serverseitiger Versand der Buchungs-E-Mails (best-effort).
// Lädt Vorlagen + Kontaktdaten, rendert das Branding-Layout und sendet via SMTP.
// Ohne SMTP-Konfiguration passiert einfach nichts.
import { adminDb } from "@/lib/firebase/admin";
import { getContactData } from "@/lib/contact/server";
import { getTransport, mailFrom } from "@/lib/email";
import { getSettings } from "@/lib/settings/server";
import { addLog } from "@/lib/logs/server";
import {
    buildBookingVars,
    mergeTemplates,
    renderEmailHtml,
    renderEmailText,
    renderTemplate,
    type BookingEmailData,
    type EmailTemplateKey,
    type EmailTemplates,
} from "./templates";

export type { BookingEmailData };

export async function getEmailTemplates(): Promise<EmailTemplates> {
    try {
        const snap = await adminDb().collection("config").doc("emailTemplates").get();
        return mergeTemplates(snap.data());
    } catch {
        return mergeTemplates(null);
    }
}

async function send(
    key: EmailTemplateKey,
    to: string | undefined,
    b: BookingEmailData,
    cc?: string[],
): Promise<void> {
    const transport = getTransport();
    if (!transport || !to) return;

    const [templates, contact] = await Promise.all([getEmailTemplates(), getContactData()]);
    const template = templates[key];
    if (!template.enabled) return;

    const vars = buildBookingVars(b, contact, process.env.NEXT_PUBLIC_SITE_URL ?? "");
    const { subject, text, html } = renderTemplate(template, vars, contact);

    try {
        await transport.sendMail({
            from: mailFrom(),
            to,
            cc: cc && cc.length ? cc : undefined,
            subject,
            text,
            html,
        });
        await addLog({ category: "email", message: `Gesendet: „${key}" an ${to}` });
    } catch (e) {
        await addLog({ category: "email", level: "error", message: `Fehlgeschlagen: „${key}" an ${to}` });
        throw e;
    }
}

/** Bestätigung an den Kunden, sobald er über /booking eine Anfrage abschickt. */
export async function sendBookingReceived(b: BookingEmailData): Promise<void> {
    await send("bookingReceived", b.email, b).catch(() => {});
}

/** An den Kunden, wenn der Admin die Buchung bestätigt. */
export async function sendBookingConfirmed(b: BookingEmailData): Promise<void> {
    await send("bookingConfirmed", b.email, b).catch(() => {});
}

/** An den Kunden, wenn der Admin die Buchung absagt. */
export async function sendBookingCancelled(b: BookingEmailData): Promise<void> {
    await send("bookingCancelled", b.email, b).catch(() => {});
}

/** Interne Benachrichtigung an den Owner (+ optionale CC-Empfänger) über eine neue Anfrage. */
export async function notifyOwnerNewBooking(b: BookingEmailData): Promise<void> {
    const settings = await getSettings().catch(() => null);
    await send("ownerNewBooking", process.env.ADMIN_OWNER_EMAIL, b, settings?.ccEmails).catch(() => {});
}

/** Erinnerung an den Kunden (einen Tag vor dem bestätigten Termin). */
export async function sendBookingReminder(b: BookingEmailData): Promise<void> {
    await send("bookingReminder", b.email, b).catch(() => {});
}

/**
 * Eine (transaktionale) E-Mail an den Owner senden – im Seiten-Design.
 * Gibt false zurück, wenn SMTP oder ADMIN_OWNER_EMAIL fehlen.
 */
export async function sendOwnerEmail(subject: string, bodyText: string): Promise<boolean> {
    const transport = getTransport();
    const owner = process.env.ADMIN_OWNER_EMAIL;
    if (!transport || !owner) return false;

    const contact = await getContactData();
    try {
        await transport.sendMail({
            from: mailFrom(),
            to: owner,
            subject,
            text: renderEmailText(bodyText, contact),
            html: renderEmailHtml(bodyText, contact),
        });
        await addLog({ category: "email", message: `Owner-Mail: ${subject}` });
        return true;
    } catch {
        await addLog({ category: "email", level: "error", message: `Owner-Mail fehlgeschlagen: ${subject}` });
        return false;
    }
}
