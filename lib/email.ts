// Optionale E-Mail-Benachrichtigung an den Owner (best-effort).
// Wenn keine SMTP-Variablen gesetzt sind, passiert einfach nichts.
import nodemailer from "nodemailer";

function getTransport() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
}

export async function sendPasswordReset(to: string, link: string): Promise<boolean> {
    const transport = getTransport();
    if (!transport) return false;

    await transport.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: "Passwort zurücksetzen – RomaBeautyAcademy",
        text:
            `Hallo,\n\n` +
            `setze dein Admin-Passwort über diesen Link zurück:\n\n` +
            `  ${link}\n\n` +
            `Falls du das nicht angefordert hast, ignoriere diese E-Mail.`,
    });
    return true;
}

export async function notifyOwnerOfBooking(b: {
    name: string;
    email: string;
    date: string;
    time: string;
}): Promise<void> {
    const transport = getTransport();
    const owner = process.env.ADMIN_OWNER_EMAIL;
    if (!transport || !owner) return;

    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    await transport.sendMail({
        from: process.env.SMTP_USER,
        to: owner,
        subject: `Neue Terminanfrage – ${b.date} ${b.time}`,
        text:
            `Neue Terminanfrage:\n\n` +
            `  Name:   ${b.name}\n` +
            `  E-Mail: ${b.email}\n` +
            `  Termin: ${b.date} um ${b.time}\n\n` +
            `Verwalten: ${base}/admin/bookings`,
    });
}

export async function notifyOwnerOfRegistration(email: string): Promise<void> {
    const transport = getTransport();
    const owner = process.env.ADMIN_OWNER_EMAIL;
    if (!transport || !owner) return;

    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    await transport.sendMail({
        from: process.env.SMTP_USER,
        to: owner,
        subject: "Neue Admin-Registrierung – Freigabe nötig",
        text:
            `Eine neue Admin-Registrierung liegt vor:\n\n` +
            `  ${email}\n\n` +
            `Im Dashboard freigeben: ${base}/admin`,
    });
}
