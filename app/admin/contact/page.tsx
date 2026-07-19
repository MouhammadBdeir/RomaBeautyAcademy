import { requireAdmin } from "@/lib/auth/session";
import { getContactData } from "@/lib/contact/server";
import AdminNav from "@/components/admin/AdminNav";
import ContactEditor from "@/components/admin/ContactEditor";
import { getAdminT } from "@/lib/i18n/admin-server";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
    await requireAdmin();
    const [{ t }, contact] = await Promise.all([getAdminT(), getContactData()]);

    return (
        <div className="min-h-screen bg-[#F7F3EE]">
            <AdminNav />
            <main className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 sm:py-10">
                <h1 className="text-3xl font-light text-[#0B0B0B]">{t("Kontaktdaten")}</h1>
                <p className="mt-1 mb-8 text-sm text-gray-500">
                    {t("Diese Angaben erscheinen im Footer, auf der Buchungsseite und im Impressum – live, sobald du speicherst.")}
                </p>
                <ContactEditor initial={contact} />
            </main>
        </div>
    );
}
