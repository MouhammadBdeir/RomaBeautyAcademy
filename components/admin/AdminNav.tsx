"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

const LINKS = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/bookings", label: "Buchungen" },
    { href: "/admin/media", label: "Medien" },
    { href: "/admin/contact", label: "Kontakt" },
    { href: "/admin/email", label: "E-Mails" },
    { href: "/admin/settings", label: "Einstellungen" },
];

export default function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    async function logout() {
        setLoading(true);
        await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
        await signOut(auth).catch(() => {});
        router.push("/admin/login");
        router.refresh();
    }

    return (
        <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6 lg:gap-8">
                    <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="tracking-[0.25em] font-bold text-sm whitespace-nowrap"
                    >
                        <span className="text-[#C8A24A] font-medium">RomaBeauty</span>Academy
                    </Link>
                    <nav className="hidden lg:flex gap-6 text-sm">
                        {LINKS.map((l) => {
                            const active = pathname === l.href;
                            return (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className={
                                        active
                                            ? "text-[#0B0B0B] font-medium"
                                            : "text-gray-500 hover:text-[#C8A24A] transition"
                                    }
                                >
                                    {l.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Abmelden – Desktop */}
                <button
                    onClick={logout}
                    disabled={loading}
                    className="hidden lg:inline-flex px-4 py-2 rounded-full border border-black/10 text-sm hover:border-[#C8A24A] transition disabled:opacity-50"
                >
                    {loading ? "Abmelden …" : "Abmelden"}
                </button>

                {/* Hamburger – Mobil */}
                <button
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? "Menü schließen" : "Menü öffnen"}
                    aria-expanded={open}
                    className="lg:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 hover:border-[#C8A24A] transition"
                >
                    <span className="relative block h-3.5 w-5">
                        <span className={`absolute left-0 block h-0.5 w-5 rounded-full bg-[#0B0B0B] transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                        <span className={`absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-[#0B0B0B] transition-all ${open ? "opacity-0" : "opacity-100"}`} />
                        <span className={`absolute left-0 block h-0.5 w-5 rounded-full bg-[#0B0B0B] transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
                    </span>
                </button>
            </div>

            {/* Ausklappbares Menü – Mobil */}
            {open && (
                <div className="lg:hidden border-t border-black/5 bg-white/95 backdrop-blur-xl">
                    <nav className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
                        {LINKS.map((l) => {
                            const active = pathname === l.href;
                            return (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setOpen(false)}
                                    className={`rounded-xl px-3 py-2.5 text-sm transition ${
                                        active
                                            ? "bg-[#C8A24A]/15 text-[#0B0B0B] font-medium"
                                            : "text-gray-600 hover:bg-black/5"
                                    }`}
                                >
                                    {l.label}
                                </Link>
                            );
                        })}
                        <button
                            onClick={logout}
                            disabled={loading}
                            className="mt-1 rounded-xl border border-black/10 px-3 py-2.5 text-left text-sm hover:border-[#C8A24A] transition disabled:opacity-50"
                        >
                            {loading ? "Abmelden …" : "Abmelden"}
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
}
