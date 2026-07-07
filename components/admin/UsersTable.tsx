"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/lib/auth/users";
import { useConfirm, type ConfirmOptions } from "./ConfirmDialog";

type Action = "approve" | "reject" | "revoke" | "delete" | "resetPassword";

const USER_CONFIRM: Record<Action, (email: string) => ConfirmOptions> = {
    approve: (email) => ({
        title: "Konto freigeben?",
        message: `${email} erhält damit vollen Zugriff auf den Admin-Bereich.`,
        confirmLabel: "Freigeben",
    }),
    reject: (email) => ({
        title: "Anfrage ablehnen?",
        message: `Die Registrierung von ${email} wird abgelehnt und das Konto gelöscht.`,
        confirmLabel: "Ablehnen",
        tone: "danger",
    }),
    resetPassword: (email) => ({
        title: "Passwort zurücksetzen?",
        message: `Für ${email} wird ein Link zum Zurücksetzen erstellt bzw. per E-Mail gesendet.`,
        confirmLabel: "Zurücksetzen",
    }),
    revoke: (email) => ({
        title: "Admin-Rechte entziehen?",
        message: `${email} verliert den Zugriff auf den Admin-Bereich.`,
        confirmLabel: "Entziehen",
        tone: "danger",
    }),
    delete: (email) => ({
        title: "Konto endgültig löschen?",
        message: `${email} wird unwiderruflich gelöscht. Das kann nicht rückgängig gemacht werden.`,
        confirmLabel: "Löschen",
        tone: "danger",
    }),
};

const ROLE_BADGE: Record<AdminUser["role"], { label: string; cls: string }> = {
    owner: { label: "Owner", cls: "bg-[#C8A24A]/20 text-[#0B0B0B]" },
    admin: { label: "Admin", cls: "bg-green-100 text-green-700" },
    pending: { label: "Wartet auf Freigabe", cls: "bg-gray-100 text-gray-600" },
};

const btnPrimary = "px-3 py-1.5 rounded-full bg-[#C8A24A] text-black text-xs hover:scale-[1.03] transition disabled:opacity-50";
const btnGhost = "px-3 py-1.5 rounded-full border border-black/10 text-xs hover:border-[#C8A24A] transition disabled:opacity-50";
const btnDanger = "px-3 py-1.5 rounded-full border border-black/10 text-xs hover:border-red-400 hover:text-red-600 transition disabled:opacity-50";

export default function UsersTable({ initial, isOwner }: { initial: AdminUser[]; isOwner: boolean }) {
    const router = useRouter();
    const { confirm, dialog } = useConfirm();
    const [users, setUsers] = useState<AdminUser[]>(initial);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    async function act(user: AdminUser, action: Action) {
        const ok = await confirm(USER_CONFIRM[action](user.email));
        if (!ok) return;

        const uid = user.uid;
        setBusy(uid);
        setError(null);
        setNotice(null);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid, action }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error ?? "Aktion fehlgeschlagen.");

            if (action === "resetPassword") {
                setNotice(
                    data.emailed
                        ? "Passwort-Reset-Link wurde per E-Mail an den Benutzer gesendet."
                        : `Kein SMTP konfiguriert – Reset-Link manuell weitergeben:\n${data.link}`,
                );
            } else if (action === "reject" || action === "delete") {
                setUsers((prev) => prev.filter((u) => u.uid !== uid));
            } else {
                const role: AdminUser["role"] = action === "approve" ? "admin" : "pending";
                setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
            }
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Aktion fehlgeschlagen.");
        } finally {
            setBusy(null);
        }
    }

    if (users.length === 0) {
        return <p className="text-sm text-gray-500">Keine Benutzer gefunden.</p>;
    }

    function actionsFor(u: AdminUser) {
        const disabled = busy === u.uid;
        if (u.role === "pending") {
            return (
                <>
                    <button onClick={() => act(u, "approve")} disabled={disabled} className={btnPrimary}>Freigeben</button>
                    <button onClick={() => act(u, "reject")} disabled={disabled} className={btnDanger}>Ablehnen</button>
                </>
            );
        }
        if (u.role === "admin") {
            return (
                <>
                    <button onClick={() => act(u, "resetPassword")} disabled={disabled} className={btnGhost}>Passwort zurücksetzen</button>
                    <button onClick={() => act(u, "revoke")} disabled={disabled} className={btnGhost}>Rechte entziehen</button>
                    <button onClick={() => act(u, "delete")} disabled={disabled} className={btnDanger}>Löschen</button>
                </>
            );
        }
        return <span className="text-xs text-gray-400">—</span>;
    }

    return (
        <div>
            {notice && (
                <div className="mb-3 rounded-xl border border-[#C8A24A]/40 bg-[#C8A24A]/10 px-4 py-3 text-sm text-[#0B0B0B] whitespace-pre-wrap break-words">
                    {notice}
                </div>
            )}
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            {/* Tabelle – ab md */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-black/10 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 border-b border-black/5">
                            <th className="px-4 py-3 font-medium">E-Mail</th>
                            <th className="px-4 py-3 font-medium">Rolle</th>
                            <th className="px-4 py-3 font-medium">Registriert</th>
                            <th className="px-4 py-3 font-medium">Letzter Login</th>
                            {isOwner && <th className="px-4 py-3 font-medium text-right">Aktionen</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => {
                            const badge = ROLE_BADGE[u.role];
                            return (
                                <tr key={u.uid} className="border-b border-black/5 last:border-0">
                                    <td className="px-4 py-3 text-[#0B0B0B]">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{u.created}</td>
                                    <td className="px-4 py-3 text-gray-500">{u.lastLogin}</td>
                                    {isOwner && (
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2 justify-end">{actionsFor(u)}</div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Karten – mobil */}
            <div className="space-y-3 md:hidden">
                {users.map((u) => {
                    const badge = ROLE_BADGE[u.role];
                    return (
                        <div key={u.uid} className="rounded-2xl border border-black/10 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                                <p className="min-w-0 break-all font-medium text-[#0B0B0B]">{u.email}</p>
                                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                            </div>
                            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <dt className="text-gray-400">Registriert</dt>
                                    <dd className="text-gray-600">{u.created}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-400">Letzter Login</dt>
                                    <dd className="text-gray-600">{u.lastLogin}</dd>
                                </div>
                            </dl>
                            {isOwner && u.role !== "owner" && (
                                <div className="mt-4 flex flex-wrap gap-2">{actionsFor(u)}</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {dialog}
        </div>
    );
}
