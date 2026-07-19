import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listUsers } from "@/lib/auth/users";
import { getStorageUsage } from "@/lib/media/server";
import AdminNav from "@/components/admin/AdminNav";
import UsersTable from "@/components/admin/UsersTable";
import NotificationsPanel from "@/components/admin/NotificationsPanel";
import DashboardTabs from "@/components/admin/DashboardTabs";
import { getNotifications } from "@/lib/notifications/server";
import { getAdminT } from "@/lib/i18n/admin-server";

export const dynamic = "force-dynamic";

function formatBytes(b: number): string {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    if (b < 1024 ** 3) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
    return `${(b / 1024 ** 3).toFixed(2)} GB`;
}

function formatUsd(v: number): string {
    if (v > 0 && v < 0.01) return "< $0.01";
    return `$${v.toFixed(2)}`;
}

export default async function AdminDashboard() {
    const session = await requireAdmin();
    const [{ t }, users, storage, notifications] = await Promise.all([
        getAdminT(),
        listUsers(),
        getStorageUsage(),
        getNotifications(),
    ]);
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    const storageContent = (
        <section>
            <p className="mb-4 text-sm text-gray-500">{t("Firebase Storage – Nutzung und grobe Kostenschätzung.")}</p>
            {storage.ok ? (
                <div className="rounded-2xl border border-black/10 bg-white p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <p className="text-3xl font-light text-[#0B0B0B]">{storage.fileCount}</p>
                            <p className="text-sm text-gray-500">{t("Dateien")}</p>
                        </div>
                        <div>
                            <p className="text-3xl font-light text-[#0B0B0B]">{formatBytes(storage.totalBytes)}</p>
                            <p className="text-sm text-gray-500">{t("belegter Speicher")}</p>
                        </div>
                        <div>
                            <p className="text-3xl font-light text-[#C8A24A]">{formatUsd(storage.estimatedMonthlyUsd)}</p>
                            <p className="text-sm text-gray-500">{t("geschätzt / Monat")}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-400">
                        {t(
                            "Schätzung nur für Speicherung (~$0,026 / GB·Monat). Download-Traffic ist nicht enthalten – die genaue Abrechnung siehst du in der Firebase Console.",
                        )}
                        {projectId && (
                            <>
                                {" "}
                                <a
                                    href={`https://console.firebase.google.com/project/${projectId}/usage`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#C8A24A] hover:underline"
                                >
                                    {t("Zur Nutzungsübersicht ↗")}
                                </a>
                            </>
                        )}
                    </p>
                </div>
            ) : (
                <p className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-gray-500">
                    {t("Speichernutzung nicht verfügbar – ist Firebase Storage im Projekt aktiviert?")}
                </p>
            )}
        </section>
    );

    const usersContent = (
        <section>
            <p className="mb-4 text-sm text-gray-500">
                {session.owner
                    ? t("Alle Konten. Neue Registrierungen gibst du hier frei oder lehnst sie ab.")
                    : t("Alle Admin-Konten.")}
            </p>
            <UsersTable initial={users} isOwner={session.owner} />
        </section>
    );

    return (
        <div className="min-h-screen bg-[#F7F3EE]">
            <AdminNav />

            <main className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 sm:py-10">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-light text-[#0B0B0B]">{t("Dashboard")}</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {t("Willkommen,")}{" "}
                            <span className="font-medium text-[#0B0B0B]">{session.email ?? t("Admin")}</span>
                            {session.owner && (
                                <span className="ms-2 text-xs px-2 py-0.5 rounded-full bg-[#C8A24A]/20 text-[#0B0B0B]">
                                    {t("Owner")}
                                </span>
                            )}
                        </p>
                    </div>

                    <Link
                        href="/admin/media"
                        className="px-5 py-2 rounded-full bg-[#C8A24A] text-black text-sm font-medium hover:scale-[1.03] transition"
                    >
                        {t("Bilder & Galerie verwalten →")}
                    </Link>
                </div>

                <div className="mt-8">
                    <DashboardTabs
                        tabs={[
                            {
                                id: "notifications",
                                label: t("Benachrichtigungen & E-Mails"),
                                content: <NotificationsPanel initial={notifications} />,
                            },
                            { id: "storage", label: t("Speicher & Kosten"), content: storageContent },
                            { id: "users", label: t("Benutzer"), content: usersContent },
                        ]}
                    />
                </div>
            </main>
        </div>
    );
}
