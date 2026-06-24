import { requireAdmin } from "@/lib/auth/session";
import { getEmailTemplates } from "@/lib/email/server";
import { getContactData } from "@/lib/contact/server";
import AdminNav from "@/components/admin/AdminNav";
import EmailTemplatesManager from "@/components/admin/EmailTemplatesManager";

export const dynamic = "force-dynamic";

export default async function AdminEmailPage() {
    await requireAdmin();
    const [templates, contact] = await Promise.all([getEmailTemplates(), getContactData()]);

    return (
        <div className="min-h-screen bg-[#F7F3EE]">
            <AdminNav />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <h1 className="text-3xl font-light text-[#0B0B0B]">E-Mail-Vorlagen</h1>
                <p className="mt-1 mb-8 text-sm text-gray-500">
                    Diese E-Mails verschickt die Seite automatisch. Betreff und Text kannst du frei anpassen –
                    Design (Logo &amp; Farben) und die Kontaktdaten im Fußbereich kommen automatisch aus deinen{" "}
                    <span className="text-[#0B0B0B]">Kontaktdaten</span>.
                </p>
                <EmailTemplatesManager initial={templates} contact={contact} />
            </main>
        </div>
    );
}
