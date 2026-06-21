"use client";

import { useState } from "react";
import { toDateKey, dayState } from "@/lib/bookings/types";
import type { ContactData } from "@/lib/contact/types";

const MONTHS = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function BookingForm({
    holidays,
    todayKey,
    contact,
}: {
    holidays: Record<string, string>;
    todayKey: string;
    contact: ContactData;
}) {
    const [ty, tm] = todayKey.split("-").map(Number);

    const [month, setMonth] = useState(tm - 1);
    const [year, setYear] = useState(ty);
    const [selected, setSelected] = useState<string | null>(null);
    const [time, setTime] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
    const [privacy, setPrivacy] = useState(false);
    const [human, setHuman] = useState(false);
    const [honeypot, setHoneypot] = useState("");

    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const isCurrentMonth = year === ty && month === tm - 1;

    function prevMonth() {
        if (isCurrentMonth) return;
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

    async function submit() {
        if (!selected || !time) {
            setError("Bitte Datum und Uhrzeit wählen.");
            return;
        }
        if (!form.name.trim() || !form.email.trim()) {
            setError("Bitte Name und E-Mail angeben.");
            return;
        }
        if (!form.phone.trim()) {
            setError("Bitte deine Telefonnummer angeben.");
            return;
        }
        if (!privacy) {
            setError("Bitte bestätige die Datenschutzerklärung.");
            return;
        }
        if (!human) {
            setError("Bitte bestätige, dass du ein Mensch bist.");
            return;
        }
        setError(null);
        setSending(true);
        try {
            const res = await fetch("/api/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: `+49 ${form.phone.trim()}`,
                    message: form.message,
                    date: selected,
                    time,
                    privacyConsent: true,
                    website: honeypot,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error ?? "Anfrage fehlgeschlagen.");
            setDone(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Anfrage fehlgeschlagen.");
        } finally {
            setSending(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#F7F3EE] text-[#0B0B0B] px-6 py-28">
            <div className="max-w-6xl mx-auto">

                <div className="text-center">
                    <p className="text-[#C8A24A] tracking-[0.3em] uppercase text-sm">Online Buchung</p>
                    <h1 className="mt-4 text-5xl md:text-6xl font-light">
                        Termin <span className="text-[#C8A24A]">buchen</span>
                    </h1>
                </div>

                {done ? (
                    <div className="mt-16 max-w-xl mx-auto rounded-3xl bg-white p-10 text-center shadow-lg">
                        <div className="text-4xl">✅</div>
                        <h2 className="mt-4 text-2xl font-medium">Anfrage erhalten!</h2>
                        <p className="mt-3 text-gray-600">
                            Vielen Dank, {form.name}. Wir melden uns zur Bestätigung deines Termins am{" "}
                            <span className="font-medium text-[#0B0B0B]">{selected}</span> um{" "}
                            <span className="font-medium text-[#0B0B0B]">{time}</span> Uhr.
                        </p>
                    </div>
                ) : (
                    <div className="mt-16 grid lg:grid-cols-2 gap-10">

                        {/* KALENDER */}
                        <div className="bg-white rounded-3xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={prevMonth}
                                    disabled={isCurrentMonth}
                                    aria-label="Vorheriger Monat"
                                    className="text-[#C8A24A] disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    ←
                                </button>
                                <h2 className="text-xl">{MONTHS[month]} {year}</h2>
                                <button onClick={nextMonth} aria-label="Nächster Monat" className="text-[#C8A24A]">→</button>
                            </div>

                            <div className="grid grid-cols-7 gap-2 text-center text-sm">
                                {WEEKDAYS.map((w) => (
                                    <div key={w} className="text-xs font-medium text-gray-400 pb-1">{w}</div>
                                ))}

                                {Array.from({ length: firstWeekday }).map((_, i) => (
                                    <div key={`e-${i}`} />
                                ))}

                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                    const date = new Date(year, month, day);
                                    const key = toDateKey(date);
                                    const st = dayState(date, holidays);
                                    const past = key < todayKey;
                                    const disabled = past || st.closed;
                                    const isSel = selected === key;

                                    return (
                                        <button
                                            key={day}
                                            disabled={disabled}
                                            title={st.closed ? st.reason ?? undefined : undefined}
                                            onClick={() => {
                                                setSelected(key);
                                                setTime(null);
                                            }}
                                            className={`p-3 rounded-xl text-sm transition ${
                                                disabled
                                                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                                    : isSel
                                                        ? "bg-[#C8A24A] text-black"
                                                        : "bg-[#C8A24A]/10 hover:bg-[#C8A24A]/30 text-[#0B0B0B]"
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="mt-4 text-xs text-gray-400">
                                Sonntage und gesetzliche Feiertage sind nicht buchbar.
                            </p>

                            {selected && (
                                <div className="mt-8">
                                    <h3 className="mb-4 font-medium">Uhrzeit am {selected}</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {TIME_SLOTS.map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setTime(t)}
                                                className={`p-3 rounded-xl border transition hover:border-[#C8A24A] ${
                                                    time === t ? "bg-[#C8A24A] text-black border-[#C8A24A]" : "border-black/10"
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* FORMULAR */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl shadow-lg">
                                <h3 className="text-xl mb-4">Deine Daten</h3>

                                <input
                                    placeholder="Name *"
                                    value={form.name}
                                    className="w-full p-3 border border-black/10 rounded-xl mb-3 outline-none focus:border-[#C8A24A]"
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                                <input
                                    type="email"
                                    placeholder="E-Mail *"
                                    value={form.email}
                                    className="w-full p-3 border border-black/10 rounded-xl mb-3 outline-none focus:border-[#C8A24A]"
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                                <div className="mb-3 flex">
                                    <span className="inline-flex items-center rounded-l-xl border border-r-0 border-black/10 bg-[#F7F3EE] px-3 text-gray-600">
                                        +49
                                    </span>
                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        required
                                        placeholder="151 23456789 *"
                                        value={form.phone}
                                        className="w-full rounded-r-xl border border-black/10 p-3 outline-none focus:border-[#C8A24A]"
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    />
                                </div>
                                <textarea
                                    placeholder="Nachricht (optional)"
                                    value={form.message}
                                    rows={3}
                                    className="w-full p-3 border border-black/10 rounded-xl outline-none focus:border-[#C8A24A]"
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                />

                                <div className="mt-4 text-sm text-gray-600">
                                    {selected && time ? (
                                        <span>
                                            Gewählter Termin:{" "}
                                            <span className="text-[#C8A24A] font-medium">{selected} um {time} Uhr</span>
                                        </span>
                                    ) : (
                                        "Bitte Datum und Uhrzeit im Kalender wählen."
                                    )}
                                </div>

                                <div className="mt-4 space-y-2">
                                    <label className="flex items-start gap-2 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={privacy}
                                            onChange={(e) => setPrivacy(e.target.checked)}
                                            className="mt-1 accent-[#C8A24A]"
                                        />
                                        <span>
                                            Ich habe die{" "}
                                            <a href="/datenschutz" target="_blank" rel="noreferrer" className="text-[#C8A24A] underline">
                                                Datenschutzerklärung
                                            </a>{" "}
                                            gelesen und akzeptiere sie. *
                                        </span>
                                    </label>
                                    {/* Honeypot – für Bots, für Menschen unsichtbar */}
                                    <input
                                        type="text"
                                        name="website"
                                        value={honeypot}
                                        onChange={(e) => setHoneypot(e.target.value)}
                                        tabIndex={-1}
                                        autoComplete="off"
                                        aria-hidden="true"
                                        className="hidden"
                                    />

                                    {/* Sicherheitsprüfung */}
                                    <button
                                        type="button"
                                        onClick={() => setHuman((v) => !v)}
                                        aria-pressed={human}
                                        className={`flex w-full max-w-xs items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
                                            human ? "border-[#C8A24A] bg-[#C8A24A]/5" : "border-black/15 bg-white hover:border-[#C8A24A]/60"
                                        }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span
                                                className={`flex h-6 w-6 items-center justify-center rounded-md border text-sm ${
                                                    human ? "border-[#C8A24A] bg-[#C8A24A] text-black" : "border-gray-300 text-transparent"
                                                }`}
                                            >
                                                ✓
                                            </span>
                                            <span className="text-sm text-gray-700">Ich bin kein Roboter</span>
                                        </span>
                                        <span className="text-[10px] leading-tight text-gray-400">
                                            Sicherheits-
                                            <br />
                                            prüfung
                                        </span>
                                    </button>
                                </div>

                                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                                <button
                                    onClick={submit}
                                    disabled={sending}
                                    className="mt-5 w-full py-4 bg-[#C8A24A] text-black rounded-full font-medium hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {sending ? "Wird gesendet …" : "Termin anfragen"}
                                </button>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-lg">
                                <h3 className="text-xl mb-2">Kontakt</h3>
                                {(contact.street || contact.city) && (
                                    <p>{[contact.street, [contact.zip, contact.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}</p>
                                )}
                                {contact.phone && <p className="text-[#C8A24A] mt-2">{contact.phone}</p>}
                                {contact.email && <p className="text-gray-600 mt-1">{contact.email}</p>}
                                <div className="mt-4 rounded-xl overflow-hidden">
                                    <iframe
                                        title="Standort"
                                        className="w-full h-60"
                                        loading="lazy"
                                        src={`https://maps.google.com/maps?q=${encodeURIComponent([contact.street, contact.zip, contact.city].filter(Boolean).join(" ") || "Lippstadt")}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
