"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { bookingDayState, type SiteSettings } from "@/lib/settings/types";

const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const weekdayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

// Client-Erkennung ohne setState-im-Effect -> hydration-sicher.
// Server (und erstes Hydration-Render) liefert false, danach true.
const subscribe = () => () => {};
function useIsClient() {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
}

export default function Contact({
    holidays,
    settings,
}: {
    holidays: Record<string, string>;
    settings: SiteSettings;
}) {
    const isClient = useIsClient();

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [month, setMonth] = useState(() => new Date().getMonth());
    const [year, setYear] = useState(() => new Date().getFullYear());

    // "Heute" einmalig pro Mount – wird nur im clientseitig gerenderten
    // Kalender verwendet, daher kein Hydration-Konflikt.
    const today = useMemo(() => {
        const t = new Date();
        return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
    }, []);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Wochentag des 1. (Mo = 0 … So = 6) für den korrekten Spalten-Offset.
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

    const isCurrentMonth = year === today.y && month === today.m;

    const prevMonth = () => {
        if (isCurrentMonth) return; // nicht in die Vergangenheit blättern
        if (month === 0) {
            setMonth(11);
            setYear((y) => y - 1);
        } else {
            setMonth((m) => m - 1);
        }
    };

    const nextMonth = () => {
        if (month === 11) {
            setMonth(0);
            setYear((y) => y + 1);
        } else {
            setMonth((m) => m + 1);
        }
    };

    const isPast = (day: number) =>
        year === today.y && month === today.m && day < today.d;

    return (
        <section id="contact" className="py-28 px-6 bg-gradient-to-b from-white to-[#F7F3EE] scroll-mt-24">

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">

                {/* LEFT */}
                <div>

                    <h2 className="text-4xl md:text-5xl font-light text-[#0B0B0B]">
                        Termin <span className="text-[#C8A24A]">buchen</span>
                    </h2>

                    <p className="mt-6 text-gray-600 leading-relaxed">
                        Wähle deinen Wunschtermin bequem online. Wir bestätigen deinen Termin schnell und zuverlässig.
                    </p>

                    <div className="mt-6 text-sm text-gray-700">
                        {selectedDate ? (
                            <span>
                                Gewählter Termin:{" "}
                                <span className="text-[#C8A24A] font-medium">
                                    {selectedDate}
                                </span>
                            </span>
                        ) : (
                            "Bitte wähle ein Datum aus"
                        )}
                    </div>

                    <Link
                        href={selectedDate ? `/booking?date=${selectedDate}` : "/booking"}
                        className="
                        mt-8 inline-block px-10 py-4
                        bg-[#C8A24A]
                        text-black font-medium
                        rounded-full
                        relative overflow-hidden
                        transition-all duration-300
                        hover:scale-105
                        hover:shadow-[0_10px_40px_rgba(200,162,74,0.35)]
                        group
                    "
                    >
                        {/* shine effect */}
                        <span className="
                            absolute inset-0
                            bg-white/30
                            translate-x-[-100%]
                            group-hover:translate-x-[100%]
                            transition-transform duration-700
                            skew-x-12
                        "/>

                        <span className="relative z-10">
                            Termin anfragen
                        </span>
                    </Link>

                </div>

                {/* RIGHT CALENDAR */}
                {!isClient ? (
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-black/10 min-h-[320px] flex items-center justify-center text-sm text-gray-400">
                        Kalender wird geladen …
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-black/10">

                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-6">

                            <button
                                onClick={prevMonth}
                                disabled={isCurrentMonth}
                                aria-label="Vorheriger Monat"
                                className="text-[#C8A24A] font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                ←
                            </button>

                            <h3 className="text-lg font-medium text-[#0B0B0B]">
                                {monthNames[month]} <span className="text-gray-500">{year}</span>
                            </h3>

                            <button
                                onClick={nextMonth}
                                aria-label="Nächster Monat"
                                className="text-[#C8A24A] font-medium"
                            >
                                →
                            </button>

                        </div>

                        {/* DAYS */}
                        <div className="grid grid-cols-7 gap-2 text-center text-sm">

                            {weekdayNames.map((w) => (
                                <div key={w} className="text-xs font-medium text-gray-400 pb-1">
                                    {w}
                                </div>
                            ))}

                            {Array.from({ length: firstWeekday }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}

                            {days.map((day) => {
                                const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                const past = isPast(day);
                                const st = bookingDayState(new Date(year, month, day), holidays, settings);
                                const disabled = past || st.closed;

                                return (
                                    <button
                                        key={day}
                                        disabled={disabled}
                                        title={st.closed ? st.reason ?? undefined : undefined}
                                        onClick={() => setSelectedDate(dateString)}
                                        className={`p-2 rounded-lg transition ${
                                            disabled
                                                ? "text-gray-300 line-through cursor-not-allowed"
                                                : selectedDate === dateString
                                                    ? "bg-[#C8A24A] text-black"
                                                    : "text-gray-600 hover:bg-[#C8A24A]/20"
                                        }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}

                        </div>

                        <p className="mt-4 text-xs text-gray-400">
                            {["Sonntage", settings.blockSaturdays && "Samstage", "Feiertage", settings.vacations.length > 0 && "Urlaubstage"]
                                .filter(Boolean)
                                .join(", ")}{" "}
                            sind nicht verfügbar.
                        </p>

                    </div>
                )}

            </div>

        </section>
    );
}
