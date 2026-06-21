"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DEFAULT_CONTACT, type ContactData } from "@/lib/contact/types";

const NAV = [
    { href: "/", label: "Home" },
    { href: "/#services", label: "Services" },
    { href: "/about", label: "Über uns" },
    { href: "/booking", label: "Termin buchen" },
];

const linkCls = "w-fit hover:text-[#C8A24A] hover:underline underline-offset-4 transition";

export default function Footer() {
    const [contact, setContact] = useState<ContactData>(DEFAULT_CONTACT);

    useEffect(() => {
        let active = true;
        let timer: ReturnType<typeof setTimeout>;
        const tick = async () => {
            try {
                const res = await fetch("/api/site-state", { cache: "no-store" });
                if (active && res.ok) {
                    const d = await res.json();
                    if (d?.contact) setContact({ ...DEFAULT_CONTACT, ...d.contact });
                }
            } catch {
                /* ignorieren */
            }
            if (active) {
                const hidden = typeof document !== "undefined" && document.visibilityState === "hidden";
                timer = setTimeout(tick, hidden ? 30000 : 10000);
            }
        };
        tick();
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, []);

    const cityLine = [contact.zip, contact.city].filter(Boolean).join(" ");

    return (
        <footer className="bg-[#0B0B0B] text-white">
            <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">

                {/* BRAND */}
                <div>
                    <h3 className="text-[#C8A24A] text-lg">RomaBeautyAcademy</h3>
                    <p className="mt-3 text-white/60 text-sm">Luxury Beauty Studio</p>
                </div>

                {/* NAVIGATION */}
                <div>
                    <h4 className="text-[#C8A24A]">Navigation</h4>
                    <ul className="mt-3 space-y-3 text-sm text-white/60">
                        {NAV.map((n) => (
                            <li key={n.href}>
                                <Link href={n.href} className={linkCls}>{n.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* KONTAKT */}
                <div>
                    <h4 className="text-[#C8A24A]">Kontakt</h4>
                    <div className="mt-3 space-y-1 text-sm text-white/60">
                        {contact.street && <p>{contact.street}</p>}
                        {cityLine && <p>{cityLine}</p>}
                        {contact.phone && (
                            <p>
                                <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className={linkCls}>{contact.phone}</a>
                            </p>
                        )}
                        {contact.email && (
                            <p>
                                <a href={`mailto:${contact.email}`} className={linkCls}>{contact.email}</a>
                            </p>
                        )}
                        {!contact.street && !contact.phone && !contact.email && (
                            <p className="text-white/30">—</p>
                        )}
                    </div>
                </div>

                {/* SOCIAL + RECHTLICHES */}
                <div>
                    <h4 className="text-[#C8A24A]">Social</h4>
                    <div className="mt-3 flex flex-col gap-2 text-sm text-white/60">
                        {contact.social.length === 0 ? (
                            <span className="text-white/30">—</span>
                        ) : (
                            contact.social.map((s) => (
                                <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className={linkCls}>
                                    {s.label || s.url}
                                </a>
                            ))
                        )}
                    </div>

                    <h4 className="mt-6 text-[#C8A24A]">Rechtliches</h4>
                    <ul className="mt-3 space-y-2 text-sm text-white/60">
                        <li><Link href="/impressum" className={linkCls}>Impressum</Link></li>
                        <li><Link href="/agb" className={linkCls}>AGB</Link></li>
                        <li><Link href="/datenschutz" className={linkCls}>Datenschutz</Link></li>
                        <li>
                            <button
                                onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
                                className={`${linkCls} text-left`}
                            >
                                Cookie-Einstellungen
                            </button>
                        </li>
                    </ul>
                </div>

            </div>

            <div className="border-t border-white/10 text-center text-xs text-white/40 py-6">
                © 2026 RomaBeautyAcademy — All rights reserved
            </div>
        </footer>
    );
}
