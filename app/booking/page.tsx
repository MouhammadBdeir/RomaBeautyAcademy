"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BookingPage() {

    // =========================
    // STATE
    // =========================
    const [month, setMonth] = useState(new Date().getMonth());
    const year = new Date().getFullYear();

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });

    // =========================
    // DATA
    // =========================
    const monthNames = [
        "Januar","Februar","März","April","Mai","Juni",
        "Juli","August","September","Oktober","November","Dezember"
    ];

    const timeSlots = [
        "09:00","10:00","11:00","12:00",
        "13:00","14:00","15:00","16:00","17:00"
    ];

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => {
        return new Date(year, month, i + 1);
    });

    const isWorkingDay = (date: Date) => {
        const day = date.getDay();
        return day >= 1 && day <= 5;
    };

    const step =
        !selectedDate ? 1 :
            !selectedTime ? 2 : 3;

    // =========================
    // TODO SUBMIT
    // =========================
    const handleSubmit = async () => {

        // TODO: Firebase speichern
        console.log("SAVE FIREBASE:", {
            date: selectedDate,
            time: selectedTime,
            ...form
        });

        // TODO: Nodemailer Mail senden
        console.log("SEND EMAIL");
    };

    return (
        <>
        <Navbar />
        <main className="min-h-screen bg-[#F7F3EE] text-[#0B0B0B] px-6 py-28">
            <div className="max-w-6xl mx-auto">

                {/* =========================
                    TITLE
                ========================= */}
                <div className="text-center">
                    <p className="text-[#C8A24A] tracking-[0.3em] uppercase text-sm">
                        Booking System
                    </p>

                    <h1 className="mt-4 text-5xl md:text-6xl font-light">
                        Termin <span className="text-[#C8A24A]">buchen</span>
                    </h1>
                </div>

                {/* =========================
                    STEPPER
                ========================= */}
                <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-4">

                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                            step >= 1 ? "bg-[#C8A24A]" : "bg-gray-200"
                        }`}>1</div>

                        <div className="w-16 h-[2px] bg-gray-300" />

                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                            step >= 2 ? "bg-[#C8A24A]" : "bg-gray-200"
                        }`}>2</div>

                        <div className="w-16 h-[2px] bg-gray-300" />

                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                            step >= 3 ? "bg-[#C8A24A]" : "bg-gray-200"
                        }`}>3</div>

                    </div>
                </div>

                {/* =========================
                    GRID
                ========================= */}
                <div className="mt-16 grid lg:grid-cols-2 gap-10">

                    {/* =========================
                        CALENDAR + TIME
                    ========================= */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg">

                        {/* MONTH NAV */}
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => setMonth(m => Math.max(m - 1, 0))}>
                                ←
                            </button>

                            <h2 className="text-xl">
                                {monthNames[month]} {year}
                            </h2>

                            <button onClick={() => setMonth(m => Math.min(m + 1, 11))}>
                                →
                            </button>
                        </div>

                        {/* DAYS */}
                        <div className="grid grid-cols-7 gap-2 text-center text-sm">

                            {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d => (
                                <div key={d} className="text-gray-400">
                                    {d}
                                </div>
                            ))}

                            {days.map((date, i) => {

                                const working = isWorkingDay(date);

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDate(date)}
                                        className={`
                                            p-3 rounded-xl transition
                                            ${
                                            working
                                                ? "bg-[#C8A24A]/10 hover:bg-[#C8A24A]"
                                                : "bg-gray-100 text-gray-400"
                                        }
                                            ${
                                            selectedDate?.toDateString() === date.toDateString()
                                                ? "bg-[#C8A24A] text-black scale-110"
                                                : ""
                                        }
                                        `}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        {/* TIME SLOTS */}
                        {selectedDate && (
                            <div className="mt-8 opacity-0 animate-fadeIn">

                                <h3 className="mb-4 font-medium">
                                    Uhrzeiten
                                </h3>

                                <div className="grid grid-cols-3 gap-3">

                                    {timeSlots.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`
                                                p-3 rounded-xl border transition
                                                hover:border-[#C8A24A]
                                                ${
                                                selectedTime === time
                                                    ? "bg-[#C8A24A] text-black scale-105"
                                                    : ""
                                            }
                                            `}
                                        >
                                            {time}
                                        </button>
                                    ))}

                                </div>
                            </div>
                        )}

                    </div>

                    {/* =========================
                        FORM + CONTACT
                    ========================= */}
                    <div className="space-y-6">

                        {/* FORM */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg">

                            <h3 className="text-xl mb-4">Deine Daten</h3>

                            <input
                                placeholder="Name"
                                className="w-full p-3 border rounded-xl mb-3"
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />

                            <input
                                placeholder="Email"
                                className="w-full p-3 border rounded-xl mb-3"
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />

                            <input
                                placeholder="Telefon"
                                className="w-full p-3 border rounded-xl mb-3"
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                            />

                            <textarea
                                placeholder="Nachricht"
                                className="w-full p-3 border rounded-xl"
                                onChange={e => setForm({ ...form, message: e.target.value })}
                            />

                        </div>

                        {/* CONTACT */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg">

                            <h3 className="text-xl mb-2">Kontakt</h3>

                            <p>Musterstraße 15, Lippstadt</p>
                            <p className="text-[#C8A24A] mt-2">+49 123 456789</p>

                            <div className="mt-4 rounded-xl overflow-hidden">
                                <iframe
                                    className="w-full h-60"
                                    loading="lazy"
                                    src="https://maps.google.com/maps?q=lippstadt&t=&z=13&ie=UTF8&iwloc=&output=embed"
                                />
                            </div>

                        </div>

                        {/* SUBMIT */}
                        <button
                            onClick={handleSubmit}
                            className="
                                w-full py-4
                                bg-[#C8A24A]
                                rounded-full
                                font-medium
                                hover:scale-105
                                transition
                            "
                        >
                            Termin buchen
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                            * Firebase & Email Integration folgt (TODO)
                        </p>

                    </div>

                </div>

            </div>



        </main>
    <Footer />
            </>
    );
}