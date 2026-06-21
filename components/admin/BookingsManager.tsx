"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking, BookingStatus } from "@/lib/bookings/types";
import { STATUS_LABEL, toDateKey, dayState } from "@/lib/bookings/types";

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

function errMsg(err: unknown): string {
    return err instanceof Error ? err.message : "Etwas ist schiefgelaufen.";
}

export default function BookingsManager({
    initial,
    holidays,
    todayKey,
}: {
    initial: Booking[];
    holidays: Record<string, string>;
    todayKey: string;
}) {
    const router = useRouter();
    const [ty, tm, td] = todayKey.split("-").map(Number);
    const tomorrowKey = toDateKey(new Date(ty, tm - 1, td + 1));

    const [bookings, setBookings] = useState<Booking[]>(initial);
    const [month, setMonth] = useState(tm - 1);
    const [year, setYear] = useState(ty);
    const [filterDate, setFilterDate] = useState<string | null>(null); // null = alle
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            ? "Alle Reservierungen"
            : filterDate === todayKey
                ? "Heute"
                : filterDate === tomorrowKey
                    ? "Morgen"
                    : `Reservierungen am ${filterDate}`;

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
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Fehlgeschlagen.");
            router.refresh();
        } catch (err) {
            setBookings(prev);
            setError(errMsg(err));
        } finally {
            setBusy(null);
        }
    }

    function setStatus(id: string, status: BookingStatus) {
        patch(id, { status }, (b) => ({ ...b, status }));
    }

    function startEdit(b: Booking) {
        setEditing(b.id);
        setEditDate(b.date);
        setEditTime(b.time || TIME_SLOTS[0]);
        setError(null);
    }

    async function saveEdit(id: string) {
        if (!editDate || !editTime) {
            setError("Bitte Datum und Uhrzeit wählen.");
            return;
        }
        const date = editDate;
        const time = editTime;
        setEditing(null);
        await patch(id, { date, time }, (b) => ({ ...b, date, time }));
    }

    async function remove(id: string) {
        if (!window.confirm("Buchung wirklich löschen?")) return;
        setBusy(id);
        setError(null);
        const prev = bookings;
        setBookings((list) => list.filter((x) => x.id !== id));
        try {
            const res = await fetch(`/api/admin/bookings?id=${encodeURIComponent(id)}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Löschen fehlgeschlagen.");
            router.refresh();
        } catch (err) {
            setBookings(prev);
            setError(errMsg(err));
        } finally {
            setBusy(null);
        }
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

    return (
        <div className="grid lg:grid-cols-[340px_1fr] gap-6">
            {/* RESERVIERUNGS-KALENDER */}
            <div className="lg:sticky lg:top-20 self-start rounded-2xl border border-black/10 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                    <button onClick={prevMonth} aria-label="Vorheriger Monat" className="text-[#C8A24A]">←</button>
                    <h3 className="font-medium">{MONTHS[month]} {year}</h3>
                    <button onClick={nextMonth} aria-label="Nächster Monat" className="text-[#C8A24A]">→</button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {WEEKDAYS.map((w) => (
                        <div key={w} className="pb-1 text-gray-400">{w}</div>
                    ))}
                    {Array.from({ length: firstWeekday }).map((_, i) => (
                        <div key={`e-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                        const date = new Date(year, month, day);
                        const key = toDateKey(date);
                        const count = countByDay[key] ?? 0;
                        const st = dayState(date, holidays);
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

                <p className="mt-3 text-xs text-gray-400">Zahl = Reservierungen am Tag. Grau = geschlossen.</p>
                <button
                    onClick={() => router.refresh()}
                    className="mt-3 w-full rounded-full border border-black/10 py-2 text-sm hover:border-[#C8A24A] transition"
                >
                    Aktualisieren
                </button>
            </div>

            {/* TABELLE */}
            <div>
                {/* Filter */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {chip("Alle", null)}
                    {chip("Heute", todayKey)}
                    {chip("Morgen", tomorrowKey)}
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
                        Keine Buchungen.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-black/5 text-left text-gray-500">
                                    <th className="px-4 py-3 font-medium">Termin</th>
                                    <th className="px-4 py-3 font-medium">Kunde</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((b) => (
                                    <tr key={b.id} className="border-b border-black/5 align-top last:border-0">
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <div className="font-medium text-[#0B0B0B]">{b.date}</div>
                                            <div className="text-gray-500">{b.time} Uhr</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-[#0B0B0B]">{b.name}</div>
                                            <div className="text-gray-500">{b.email}</div>
                                            {b.phone && <div className="text-gray-500">{b.phone}</div>}
                                            {b.message && <div className="mt-1 max-w-xs text-xs text-gray-400">{b.message}</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[b.status]}`}>
                                                {STATUS_LABEL[b.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {editing === b.id ? (
                                                <div className="flex flex-wrap items-center justify-end gap-2">
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
                                                    <button onClick={() => saveEdit(b.id)} disabled={busy === b.id} className="rounded-full bg-[#C8A24A] px-3 py-1.5 text-xs text-black transition hover:scale-[1.03] disabled:opacity-50">Speichern</button>
                                                    <button onClick={() => setEditing(null)} className="rounded-full border border-black/10 px-3 py-1.5 text-xs">Abbrechen</button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    {b.status !== "confirmed" && (
                                                        <button onClick={() => setStatus(b.id, "confirmed")} disabled={busy === b.id} className="rounded-full bg-[#C8A24A] px-3 py-1.5 text-xs text-black transition hover:scale-[1.03] disabled:opacity-50">Bestätigen</button>
                                                    )}
                                                    {b.status !== "cancelled" && (
                                                        <button onClick={() => setStatus(b.id, "cancelled")} disabled={busy === b.id} className="rounded-full border border-black/10 px-3 py-1.5 text-xs transition hover:border-red-400 hover:text-red-600 disabled:opacity-50">Absagen</button>
                                                    )}
                                                    {b.status === "cancelled" && (
                                                        <button onClick={() => setStatus(b.id, "pending")} disabled={busy === b.id} className="rounded-full border border-black/10 px-3 py-1.5 text-xs transition hover:border-[#C8A24A] disabled:opacity-50">Reaktivieren</button>
                                                    )}
                                                    <button onClick={() => startEdit(b)} disabled={busy === b.id} className="rounded-full border border-black/10 px-3 py-1.5 text-xs transition hover:border-[#C8A24A] disabled:opacity-50">Verschieben</button>
                                                    <button onClick={() => remove(b.id)} disabled={busy === b.id} className="rounded-full border border-black/10 px-3 py-1.5 text-xs transition hover:border-red-400 hover:text-red-600 disabled:opacity-50">Löschen</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
