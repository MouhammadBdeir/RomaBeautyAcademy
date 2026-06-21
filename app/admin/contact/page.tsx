import { requireAdmin } from "@/lib/auth/session";
import { getContactData } from "@/lib/contact/server";
import AdminNav from "@/components/admin/AdminNav";
import ContactEditor from "@/components/admin/ContactEditor";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
    await requireAdmin();
    const contact = await getContactData();

    return (
        <div className="min-h-screen bg-[#F7F3EE]">
            <AdminNav />
            <main className="max-w-3xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-light text-[#0B0B0B]">Kontaktdaten</h1>
                <p className="mt-1 mb-8 text-sm text-gray-500">
                    Diese Angaben erscheinen im Footer, auf der Buchungsseite und im Impressum – live, sobald du speicherst.
                </p>
                <ContactEditor initial={contact} />
            </main>
        </div>
    );
}
