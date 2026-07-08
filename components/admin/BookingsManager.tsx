"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Booking, BookingStatus } from "@/lib/bookings/types";
import { STATUS_LABEL, toDateKey } from "@/lib/bookings/types";
import { bookingDayState, type SiteSettings } from "@/lib/settings/types";
import { useConfirm, useChoice } from "./ConfirmDialog";
import { useT } from "./AdminI18nProvider";

const MONTHS = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const STATUS_BADGE: Record<BookingStatus, string> = {
    pending: "bg-gray-100 text-gray-600",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
};

export default function BookingsManager({
    initial,
    holidays,
    todayKey,
    settings,
}: {
    initial: Booking[];
    holidays: Record<string, string>;
    todayKey: string;
    settings: SiteSettings;
}) {
    const { t } = useT();
    const router = useRouter();
    const { confirm, dialog } = useConfirm();
    const { choose, dialog: choiceDialog } = useChoice();
    // Kurzzeile für Dialoge – sprachneutral (Name · Datum · Uhrzeit).
    const bookingLine = (b: Booking) => `${b.name} · ${b.date} · ${b.time}`;
    const errMsg = (err: unknown) => (err instanceof Error ? err.message : t("Etwas ist schiefgelaufen."));
    // Aus einer Benachrichtigung heraus (?focus=…): passende Buchung anzeigen + hervorheben.
    const focusId = useSearchParams().get("focus");
    const [ty, tm, td] = todayKey.split("-").map(Number);
    const tomorrowKey = toDateKey(new Date(ty, tm - 1, td + 1));

    const [bookings, setBookings] = useState<Booking[]>(initial);
    const [month, setMonth] = useState(tm - 1);
    const [year, setYear] = useState(ty);
    const [filterDate, setFilterDate] = useState<string | null>(() => {
        const target = focusId ? initial.find((b) => b.id === focusId) : undefined;
        return target ? target.date : null;
    }); // null = alle
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [highlightId, setHighlightId] = useState<string | null>(focusId);

    // Reschedule-Editor
    const [editing, setEditing] = useState<string | null>(null);
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");

    const countByDay = useMemo(() => {
        const map: Record<string, number> = {};
        for (const b of bookings) {
            if (b.status === "cancelled") continue;
            map[b.date] = (map[b.date] ?? 0) + 1;
        }
        return map;
    }, [bookings]);

    const visible = useMemo(() => {
        const list = filterDate ? bookings.filter((b) => b.date === filterDate) : bookings;
        return [...list].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    }, [bookings, filterDate]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

    const filterLabel =
        filterDate === null
            ? t("Alle Reservierungen")
            : filterDate === todayKey
                ? t("Heute")
                : filterDate === tomorrowKey
                    ? t("Morgen")
                    : `${t("Reservierungen am")} ${filterDate}`;

    function prevMonth() {
        if (month === 0) {
            setMonth(11);
            setYear((y) => y - 1);
        } else setMonth((m) => m - 1);
    }
    function nextMonth() {
        if (month === 11) {
            setMonth(0);
            setYear((y) => y + 1);
        } else setMonth((m) => m + 1);
    }

    // Zur hervorgehobenen Buchung scrollen, Markierung nach kurzer Zeit lösen.
    useEffect(() => {
        if (!highlightId) return;
        const scroll = window.setTimeout(() => {
            const els = document.querySelectorAll(`[data-booking-id="${highlightId}"]`);
            const el = Array.from(els).find((e) => (e as HTMLElement).offsetParent !== null) as
                | HTMLElement
                | undefined;
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 60);
        const clear = window.setTimeout(() => setHighlightId(null), 3500);
        return () => {
            window.clearTimeout(scroll);
            window.clearTimeout(clear);
        };
    }, [highlightId]);

    async function patch(id: string, payload: Record<string, unknown>, optimistic: (b: Booking) => Booking) {
        setBusy(id);
        setError(null);
        const prev = bookings;
        setBookings((list) => list.map((x) => (x.id === id ? optimistic(x) : x)));
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...payload }),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? t("Fehlgeschlagen."));
            router.refresh();
        } catch (err) {
            setBookings(prev);
            setError(errMsg(err));
        } finally {
            setBusy(null);
        }
    }

    async function changeStatus(b: Booking, status: BookingStatus) {
        const opts = {
            confirmed: { title: t("Buchung bestätigen?"), message: bookingLine(b), confirmLabel: t("Bestätigen") },
            cancelled: { title: t("Buchung absagen?"), message: bookingLine(b), confirmLabel: t("Absagen"), tone: "danger" as const },
            pending: { title: t("Buchung reaktivieren?"), message: bookingLine(b), confirmLabel: t("Reaktivieren") },
        };
        if (!(await confirm(opts[status]))) return;
        patch(b.id, { status }, (x) => ({ ...x, status }));
    }

    // Bestätigen + entscheiden, was mit der Benachrichtigung passiert.
    async function confirmBooking(b: Booking) {
        const choice = await choose({
            title: t("Buchung bestätigen?"),
            message: `${bookingLine(b)}\n\n${t("Was soll mit der Benachrichtigung passieren?")}`,
            choices: [
                { value: "archive", label: t("Bestätigen & Benachrichtigung archivieren") },
                { value: "delete", label: t("Bestätigen & Benachrichtigung löschen"), tone: "danger" },
            ],
        });
        if (!choice) return;
        patch(b.id, { status: "confirmed", notification: choice }, (x) => ({ ...x, status: "confirmed" }));
    }

    function startEdit(b: Booking) {
        setEditing(b.id);
        setEditDate(b.date);
        setEditTime(b.time || TIME_SLOTS[0]);
        setError(null);
    }

    async function saveEdit(id: string) {
        if (!editDate || !editTime) {
            setError(t("Bitte Datum und Uhrzeit wählen."));
            return;
        }
        const date = editDate;
        const time = editTime;
        const ok = await confirm({
            title: t("Termin verschieben?"),
            message: `${t("Neuer Termin:")} ${date} · ${time}`,
            confirmLabel: t("Verschieben"),
        });
        if (!ok) return;
        setEditing(null);
        await patch(id, { date, time }, (b) => ({ ...b, date, time }));
    }

    async function remove(b: Booking) {
        const choice = await choose({
            title: t("Buchung löschen?"),
            message: `${bookingLine(b)}\n\n${t("Was soll mit der Benachrichtigung passieren?")}`,
            choices: [
                { value: "archive", label: t("Löschen & Benachrichtigung archivieren") },
                { value: "delete", label: t("Löschen & Benachrichtigung entfernen"), tone: "danger" },
            ],
        });
        if (!choice) return;
        const id = b.id;
        setBusy(id);
        setError(null);
        const prev = bookings;
        setBookings((list) => list.filter((x) => x.id !== id));
        try {
            const res = await fetch(
                `/api/admin/bookings?id=${encodeURIComponent(id)}&notification=${choice}`,
                { method: "DELETE" },
            );
            if (!res.ok) throw new Error(t("Löschen fehlgeschlagen."));
            router.refresh();
        } catch (err) {
            setBookings(prev);
            setError(errMsg(err));
        } finally {
            setBusy(null);
        }
    }

    async function sendReminder(b: Booking) {
        const ok = await confirm({
            title: t("Erinnerung jetzt senden?"),
            message: bookingLine(b),
            confirmLabel: t("Senden"),
        });
        if (!ok) return;
        setBusy(b.id);
        setError(null);
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: b.id, action: "sendReminder" }),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? t("Senden fehlgeschlagen."));
            setBookings((list) => list.map((x) => (x.id === b.id ? { ...x, reminderSentAt: t("gerade eben") } : x)));
            router.refresh();
        } catch (err) {
            setError(errMsg(err));
        } finally {
            setBusy(null);
        }
    }

    // Erinnerungs-Status + "jetzt senden" – nur für bestätigte Termine.
    function reminderControl(b: Booking) {
        if (b.status !== "confirmed") return null;
        return (
            <div className="mt-2 flex flex-wrap items-center gap-2">
                {b.reminderSentAt ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600" title={`${t("Gesendet:")} ${b.reminderSentAt}`}>
                        <span aria-hidden>🔔</span> {t("Erinnerung gesendet")}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <span aria-hidden>🔔</span> {t("nicht gesendet")}
                    </span>
                )}
                <button
                    onClick={() => sendReminder(b)}
                    disabled={busy === b.id}
                    className="rounded-full border border-black/10 px-2.5 py-1 text-xs transition hover:border-[#C8A24A] disabled:opacity-50"
                >
                    {b.reminderSentAt ? t("Erneut senden") : t("Jetzt senden")}
                </button>
            </div>
        );
    }

    const chip = (label: string, value: string | null) => {
        const active = filterDate === value;
        return (
            <button
                onClick={() => setFilterDate(value)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                    active ? "bg-[#C8A24A] text-black" : "border border-black/10 hover:border-[#C8A24A]"
                }`}
            >
                {label}
            </button>
        );
    };

    function renderActions(b: Booking, alignEnd: boolean) {
        const wrap = `flex flex-wrap items-center gap-2 ${alignEnd ? "justify-end" : ""}`;
        if (editing === b.id) {
            return (
                <div className={wrap}>
                    <input
                        type="date"
                        min={todayKey}
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="rounded-lg border border-black/10 px-2 py-1 text-xs"
                    />
                    <select
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="rounded-lg border border-black/10 px-2 py-1 text-xs"
                    >
                        {TIME_SLOTS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <button onClick={() => saveEdit(b.id)} disabled={busy === b.id} className="rounded-full bg-[#C8A24A] px-3 py-1.5 text-xs text-black transition hover:scale-[1.03] disabled:opacity-50">{t("Speichern")}</button>
                    <button onClick={() => setEditing(null)} className="rounded-full border border-black/10 px-3 py-1.5 text-xs">{t("Abbrechen")}</button>
                </div>
            );
        }
        return (
            <div className={wrap}>
                {b.status !== "confirmed" && (
                    <button onClick={() => confirmBooking(b)} disabled={busy === b.id} className="rounded-full bg-[#C8A24A] px-3 py-1.5 text-xs text-black transition hover:scale-[1.03] disabled:opacity-50">{t("Bestätigen")}</button>
                )}
                {b.status !== "cancelled" && (
                    <button onClick={() => changeStatus(b, "cancelled")} disabled={busy === b.id} className="rounded-full border border-black/10 px-3 py-1.5 text-xs transition hover:border-red-400 hover:text-red-600 disabled:opacity-50">{t("Absagen")}</button>
                )}
                {b.status === "cancelled" && (
                    <button onClick={() => changeStatus(b, "pending")} disabled={busy === b.id} className="rounded-full border border-black/10 px-3 py-1.5 text-xs transition hover:border-[#C8A24A] disabled:opacity-50">{t("Reaktivieren")}</button>
                )}
                <button onClick={() => startEdit(b)} disabled={busy === b.id} className="rounded-full border border-black/10 px-3 py-1.5 text-xs transition hover:border-[#C8A24A] disabled:opacity-50">{t("Verschieben")}</button>
                <button onClick={() => remove(b)} disabled={busy === b.id} className="rounded-full border border-black/10 px-3 py-1.5 text-xs transition hover:border-red-400 hover:text-red-600 disabled:opacity-50">{t("Löschen")}</button>
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-[340px_1fr] gap-6">
            {/* RESERVIERUNGS-KALENDER */}
            <div className="lg:sticky lg:top-20 self-start rounded-2xl border border-black/10 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                    <button onClick={prevMonth} aria-label={t("Vorheriger Monat")} className="text-[#C8A24A]">←</button>
                    <h3 className="font-medium">{t(MONTHS[month])} {year}</h3>
                    <button onClick={nextMonth} aria-label={t("Nächster Monat")} className="text-[#C8A24A]">→</button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {WEEKDAYS.map((w) => (
                        <div key={w} className="pb-1 text-gray-400">{t(w)}</div>
                    ))}
                    {Array.from({ length: firstWeekday }).map((_, i) => (
                        <div key={`e-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                        const date = new Date(year, month, day);
                        const key = toDateKey(date);
                        const count = countByDay[key] ?? 0;
                        const st = bookingDayState(date, holidays, settings);
                        const sel = filterDate === key;
                        const isToday = key === todayKey;

                        return (
                            <button
                                key={day}
                                onClick={() => setFilterDate(sel ? null : key)}
                                title={st.closed ? st.reason ?? undefined : undefined}
                                className={`relative flex aspect-square items-center justify-center rounded-lg transition ${
                                    sel
                                        ? "bg-[#C8A24A] text-black"
                                        : st.closed
                                            ? "bg-gray-50 text-gray-300"
                                            : "hover:bg-[#C8A24A]/20"
                                } ${isToday && !sel ? "ring-1 ring-[#C8A24A]" : ""}`}
                            >
                                {day}
                                {count > 0 && (
                                    <span
                                        className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] ${
                                            sel ? "bg-black text-white" : "bg-[#C8A24A] text-black"
                                        }`}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <p className="mt-3 text-xs text-gray-400">{t("Zahl = Reservierungen am Tag. Grau = geschlossen.")}</p>
                <button
                    onClick={() => router.refresh()}
                    className="mt-3 w-full rounded-full border border-black/10 py-2 text-sm hover:border-[#C8A24A] transition"
                >
                    {t("Aktualisieren")}
                </button>
            </div>

            {/* TABELLE */}
            <div>
                {/* Filter */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {chip(t("Alle"), null)}
                    {chip(t("Heute"), todayKey)}
                    {chip(t("Morgen"), tomorrowKey)}
                    {filterDate && filterDate !== todayKey && filterDate !== tomorrowKey && (
                        <span className="rounded-full bg-[#C8A24A]/15 px-4 py-1.5 text-sm text-[#0B0B0B]">
                            {filterDate}
                        </span>
                    )}
                </div>

                {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
                <p className="mb-3 text-sm text-gray-500">{filterLabel} ({visible.length})</p>

                {visible.length === 0 ? (
                    <p className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-gray-500">
                        {t("Keine Buchungen.")}
                    </p>
                ) : (
                    <>
                        {/* Tabelle – ab md */}
                        <div className="hidden md:block overflow-x-auto rounded-2xl border border-black/10 bg-white">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-black/5 text-start text-gray-500">
                                        <th className="px-4 py-3 font-medium">{t("Termin")}</th>
                                        <th className="px-4 py-3 font-medium">{t("Kunde")}</th>
                                        <th className="px-4 py-3 font-medium">{t("Status")}</th>
                                        <th className="px-4 py-3 text-end font-medium">{t("Aktionen")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((b) => (
                                        <tr
                                            key={b.id}
                                            data-booking-id={b.id}
                                            className={`border-b border-black/5 align-top transition-colors last:border-0 ${highlightId === b.id ? "bg-[#C8A24A]/10" : ""}`}
                                        >
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <div className="font-medium text-[#0B0B0B]">{b.date}</div>
                                                <div className="text-gray-500">{b.time} {t("Uhr")}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-[#0B0B0B]">{b.name}</div>
                                                <div className="text-gray-500">{b.email}</div>
                                                {b.phone && <div className="text-gray-500">{b.phone}</div>}
                                                {(b.service || b.persons > 1) && (
                                                    <div className="mt-1 text-xs text-[#8a6d24]">
                                                        {[b.service, b.persons > 1 ? `${b.persons} ${t("Personen")}` : null].filter(Boolean).join(" · ")}
                                                    </div>
                                                )}
                                                {b.message && <div className="mt-1 max-w-xs text-xs text-gray-400">{b.message}</div>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[b.status]}`}>
                                                    {t(STATUS_LABEL[b.status])}
                                                </span>
                                                {reminderControl(b)}
                                            </td>
                                            <td className="px-4 py-3">{renderActions(b, true)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Karten – mobil */}
                        <div className="space-y-3 md:hidden">
                            {visible.map((b) => (
                                <div
                                    key={b.id}
                                    data-booking-id={b.id}
                                    className={`rounded-2xl border bg-white p-4 transition ${highlightId === b.id ? "border-[#C8A24A] ring-2 ring-[#C8A24A]" : "border-black/10"}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-medium text-[#0B0B0B]">{b.date}</div>
                                            <div className="text-sm text-gray-500">{b.time} {t("Uhr")}</div>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[b.status]}`}>
                                            {t(STATUS_LABEL[b.status])}
                                        </span>
                                    </div>
                                    <div className="mt-3 border-t border-black/5 pt-3 text-sm">
                                        <div className="font-medium text-[#0B0B0B]">{b.name}</div>
                                        <a href={`mailto:${b.email}`} className="block break-all text-gray-500 hover:text-[#C8A24A]">{b.email}</a>
                                        {b.phone && (
                                            <a href={`tel:${b.phone}`} className="block text-gray-500 hover:text-[#C8A24A]">{b.phone}</a>
                                        )}
                                        {(b.service || b.persons > 1) && (
                                            <div className="mt-1 text-xs text-[#8a6d24]">
                                                {[b.service, b.persons > 1 ? `${b.persons} ${t("Personen")}` : null].filter(Boolean).join(" · ")}
                                            </div>
                                        )}
                                        {b.message && <div className="mt-1 text-xs text-gray-400">{b.message}</div>}
                                        {reminderControl(b)}
                                    </div>
                                    <div className="mt-3 border-t border-black/5 pt-3">{renderActions(b, false)}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {dialog}
            {choiceDialog}
        </div>
    );
}
