import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings/server";
import { getLogs } from "@/lib/logs/server";
import AdminNav from "@/components/admin/AdminNav";
import SettingsManager from "@/components/admin/SettingsManager";
import { getAdminT } from "@/lib/i18n/admin-server";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
    await requireAdmin();
    const [{ t }, settings, logs] = await Promise.all([getAdminT(), getSettings(), getLogs(100)]);

    return (
        <div className="min-h-screen bg-[#F7F3EE]">
            <AdminNav />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <h1 className="text-3xl font-light text-[#0B0B0B]">{t("Einstellungen")}</h1>
                <p className="mt-1 mb-8 text-sm text-gray-500">
                    {t("Konten, Buchung, Benachrichtigungen, Wartung, Passwort und Protokoll.")}
                </p>
                <SettingsManager initial={settings} logs={logs} />
            </main>
        </div>
    );
}
