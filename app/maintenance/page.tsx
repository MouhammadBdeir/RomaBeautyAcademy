import { getContactData } from "@/lib/contact/server";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
    const contact = await getContactData();

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F7F3EE] px-6 text-[#0B0B0B]">
            <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-10 text-center shadow-sm">
                <div className="tracking-[0.25em] font-bold">
                    <span className="text-[#C8A24A] font-medium">RomaBeauty</span>Academy
                </div>
                <div className="mt-8 text-4xl">🛠️</div>
                <h1 className="mt-4 text-2xl font-light">Wir sind gleich zurück</h1>
                <p className="mt-3 text-sm text-gray-500">
                    Unsere Seite wird gerade aktualisiert. Bitte schau in Kürze noch einmal vorbei.
                </p>

                {(contact.phone || contact.email) && (
                    <div className="mt-6 border-t border-black/5 pt-6 text-sm text-gray-600">
                        <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Kontakt</p>
                        {contact.phone && <p className="text-[#C8A24A]">{contact.phone}</p>}
                        {contact.email && <p>{contact.email}</p>}
                    </div>
                )}

                <a href="/admin/login" className="mt-6 inline-block text-xs text-gray-400 hover:text-[#C8A24A]">
                    Admin-Login
                </a>
            </div>
        </main>
    );
}
