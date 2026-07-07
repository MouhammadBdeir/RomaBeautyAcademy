// Gemeinsames Layout für den Admin-Bereich: stellt die aktive Sprache bereit
// und schaltet bei Arabisch das Layout auf RTL (rechts-nach-links) um.
import type { ReactNode } from "react";
import { getAdminLang } from "@/lib/i18n/admin-server";
import { dirFor } from "@/lib/i18n/admin";
import { AdminI18nProvider } from "@/components/admin/AdminI18nProvider";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const lang = await getAdminLang();
    return (
        <AdminI18nProvider lang={lang}>
            <div dir={dirFor(lang)} lang={lang}>
                {children}
            </div>
        </AdminI18nProvider>
    );
}
