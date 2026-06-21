import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listUsers } from "@/lib/auth/users";
import { getStorageUsage } from "@/lib/media/server";
import AdminNav from "@/components/admin/AdminNav";
import UsersTable from "@/components/admin/UsersTable";

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
    const [users, storage] = await Promise.all([listUsers(), getStorageUsage()]);
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    return (
        <div className="min-h-screen bg-[#F7F3EE]">
            <AdminNav />

            <main className="max-w-5xl mx-auto px-6 py-10">

                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-light text-[#0B0B0B]">Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Willkommen,{" "}
                            <span className="font-medium text-[#0B0B0B]">{session.email ?? "Admin"}</span>
                            {session.owner && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#C8A24A]/20 text-[#0B0B0B]">
                                    Owner
                                </span>
                            )}
                        </p>
                    </div>

                    <Link
                        href="/admin/media"
                        className="px-5 py-2 rounded-full bg-[#C8A24A] text-black text-sm font-medium hover:scale-[1.03] transition"
                    >
                        Bilder &amp; Galerie verwalten →
                    </Link>
                </div>

                {/* SPEICHER & KOSTEN */}
                <section className="mt-10">
                    <h2 className="text-xl font-medium text-[#0B0B0B]">Speicher &amp; Kosten</h2>
                    <p className="mt-1 mb-4 text-sm text-gray-500">Firebase Storage – Nutzung und grobe Kostenschätzung.</p>

                    {storage.ok ? (
                        <div className="rounded-2xl border border-black/10 bg-white p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-3xl font-light text-[#0B0B0B]">{storage.fileCount}</p>
                                    <p className="text-sm text-gray-500">Dateien</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-light text-[#0B0B0B]">{formatBytes(storage.totalBytes)}</p>
                                    <p className="text-sm text-gray-500">belegter Speicher</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-light text-[#C8A24A]">{formatUsd(storage.estimatedMonthlyUsd)}</p>
                                    <p className="text-sm text-gray-500">geschätzt / Monat</p>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400">
                                Schätzung nur für Speicherung (~$0,026 / GB·Monat). Download-Traffic ist nicht enthalten – die
                                genaue Abrechnung siehst du in der Firebase Console.
                                {projectId && (
                                    <>
                                        {" "}
                                        <a
                                            href={`https://console.firebase.google.com/project/${projectId}/usage`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[#C8A24A] hover:underline"
                                        >
                                            Zur Nutzungsübersicht ↗
                                        </a>
                                    </>
                                )}
                            </p>
                        </div>
                    ) : (
                        <p className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-gray-500">
                            Speichernutzung nicht verfügbar – ist Firebase Storage im Projekt aktiviert?
                        </p>
                    )}
                </section>

                {/* BENUTZER */}
                <section className="mt-10">
                    <h2 className="text-xl font-medium text-[#0B0B0B]">Benutzer</h2>
                    <p className="mt-1 mb-4 text-sm text-gray-500">
                        {session.owner
                            ? "Alle Konten. Neue Registrierungen gibst du hier frei oder lehnst sie ab."
                            : "Alle Admin-Konten."}
                    </p>
                    <UsersTable initial={users} isOwner={session.owner} />
                </section>

            </main>
        </div>
    );
}
