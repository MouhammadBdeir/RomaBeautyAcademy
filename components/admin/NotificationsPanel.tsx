"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminNotification } from "@/lib/notifications/types";
import { STATUS_LABEL, type BookingStatus } from "@/lib/bookings/types";
import { useConfirm } from "./ConfirmDialog";
import { useT } from "./AdminI18nProvider";

const STATUS_BADGE: Record<BookingStatus, string> = {
    pending: "bg-gray-100 text-gray-600",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
};

const POLL_MS = 10000;

export default function NotificationsPanel({ initial }: { initial: AdminNotification[] }) {
    const { t } = useT();
    const router = useRouter();
    const { confirm, dialog } = useConfirm();
    const [items, setItems] = useState<AdminNotification[]>(initial);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hintId, setHintId] = useState<string | null>(null);
    const [showArchived, setShowArchived] = useState(false);

    const load = useCallback(
        async (archived = showArchived) => {
            try {
                const res = await fetch(`/api/admin/notifications${archived ? "?archived=1" : ""}`, {
                    cache: "no-store",
                });
                if (!res.ok) return;
                const data = await res.json();
                if (Array.isArray(data.notifications)) setItems(data.notifications);
            } catch {
                /* still – Polling versucht es gleich erneut */
            }
        },
        [showArchived],
    );

    // Auto-Aktualisierung: regelmäßig + sobald das Fenster wieder aktiv ist.
    useEffect(() => {
        const interval = window.setInterval(load, POLL_MS);
        const onFocus = () => load();
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onFocus);
        return () => {
            window.clearInterval(interval);
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onFocus);
        };
    }, [load]);

    function open(n: AdminNotification) {
        if (!n.read) {
            setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
            fetch("/api/admin/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: n.id, action: "read" }),
            }).catch(() => {});
        }
        router.push(`/admin/bookings?focus=${encodeURIComponent(n.bookingId)}`);
    }

    function toggleArchived() {
        const next = !showArchived;
        setShowArchived(next);
        load(next);
    }

    async function setArchived(n: AdminNotification, archived: boolean) {
        setBusy(n.id);
        setError(null);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, archived } : x)));
        try {
            const res = await fetch("/api/admin/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: n.id, action: archived ? "archive" : "unarchive" }),
            });
            if (!res.ok) throw new Error();
        } catch {
            setError(archived ? t("Archivieren fehlgeschlagen.") : t("Wiederherstellen fehlgeschlagen."));
            load();
        } finally {
            setBusy(null);
        }
    }

    async function remove(n: AdminNotification) {
        // Offene Anfragen lassen sich nicht löschen -> Hinweis.
        if (n.status === "pending") {
            setHintId(n.id);
            window.setTimeout(() => setHintId((cur) => (cur === n.id ? null : cur)), 5000);
            return;
        }
        const ok = await confirm({
            title: t("Benachrichtigung löschen?"),
            message: `${n.name} · ${n.date} · ${n.time}`,
            confirmLabel: t("Löschen"),
            tone: "danger",
        });
        if (!ok) return;

        setBusy(n.id);
        setError(null);
        setItems((prev) => prev.filter((x) => x.id !== n.id));
        try {
            const res = await fetch("/api/admin/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: n.id, action: "delete" }),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? t("Löschen fehlgeschlagen."));
        } catch (err) {
            setError(err instanceof Error ? err.message : t("Löschen fehlgeschlagen."));
            load();
        } finally {
            setBusy(null);
        }
    }

    const unread = items.filter((n) => !n.read && !n.archived).length;
    const visible = showArchived ? items : items.filter((n) => !n.archived);

    return (
        <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-medium text-[#0B0B0B]">{t("Benachrichtigungen")}</h2>
                    {unread > 0 && (
                        <span className="rounded-full bg-[#C8A24A] px-2 py-0.5 text-xs font-medium text-black">{unread}</span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleArchived}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            showArchived
                                ? "border-[#C8A24A] bg-[#C8A24A]/10 text-[#0B0B0B]"
                                : "border-black/10 text-gray-600 hover:border-[#C8A24A]"
                        }`}
                    >
                        {showArchived ? t("Aktive anzeigen") : t("Archiv anzeigen")}
                    </button>
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                        </span>
                        {t("Live")}
                    </span>
                </div>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            {visible.length === 0 ? (
                <p className="text-sm text-gray-500">
                    {showArchived ? t("Kein Archiv vorhanden.") : t("Keine neuen Benachrichtigungen.")}
                </p>
            ) : (
                <ul className="space-y-2">
                    {visible.map((n) => (
                        <li
                            key={n.id}
                            className={`rounded-xl border p-3 transition ${
                                n.archived
                                    ? "border-black/5 opacity-60"
                                    : n.read
                                      ? "border-black/5"
                                      : "border-[#C8A24A]/30 bg-[#C8A24A]/5"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <button onClick={() => open(n)} className="min-w-0 flex-1 text-left">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {!n.read && !n.archived && (
                                            <span className="h-2 w-2 rounded-full bg-[#C8A24A]" aria-label={t("ungelesen")} />
                                        )}
                                        <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[n.status]}`}>
                                            {t(STATUS_LABEL[n.status])}
                                        </span>
                                        {n.archived && (
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{t("Archiviert")}</span>
                                        )}
                                        {n.createdAt && <span className="text-xs text-gray-400">{n.createdAt}</span>}
                                    </div>
                                    <p className="mt-1 truncate font-medium text-[#0B0B0B]">{n.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {t("Termin:")} {n.date} · {n.time} {t("Uhr")}
                                    </p>
                                    <span className="mt-1 inline-block text-xs text-[#C8A24A]">{t("Zur Buchung →")}</span>
                                </button>
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                    <button
                                        onClick={() => setArchived(n, !n.archived)}
                                        disabled={busy === n.id}
                                        className="rounded-full border border-black/10 px-3 py-1 text-xs transition hover:border-[#C8A24A] disabled:opacity-50"
                                    >
                                        {n.archived ? t("Wiederherstellen") : t("Archivieren")}
                                    </button>
                                    <button
                                        onClick={() => remove(n)}
                                        disabled={busy === n.id}
                                        className="rounded-full border border-black/10 px-3 py-1 text-xs transition hover:border-red-400 hover:text-red-600 disabled:opacity-50"
                                    >
                                        {t("Löschen")}
                                    </button>
                                </div>
                            </div>
                            {hintId === n.id && (
                                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                    {t("Solange die Anfrage offen ist, kann sie nicht gelöscht werden. Bestätige oder sage den Termin zuerst ab.")}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {dialog}
        </section>
    );
}
