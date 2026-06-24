"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isNavbarStyle, type NavbarStyle } from "@/lib/branding/types";

export default function Navbar() {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [open, setOpen] = useState(false);
    const [logo, setLogo] = useState("");
    const [navbarStyle, setNavbarStyle] = useState<NavbarStyle>("serif");

    useEffect(() => {
        let raf = 0;
        const update = () => {
            raf = 0;
            const el = document.documentElement;
            const max = el.scrollHeight - el.clientHeight;
            const p = max > 0 ? window.scrollY / max : 0;
            setScrollProgress(p < 0 ? 0 : p > 1 ? 1 : p);
        };
        // Pro Frame nur einmal aktualisieren -> flüssig, ohne Verzögerung.
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    // Logo aus den Medien-Daten (live, ohne Rules).
    useEffect(() => {
        let active = true;
        let timer: ReturnType<typeof setTimeout>;
        const tick = async () => {
            try {
                const res = await fetch("/api/site-state", { cache: "no-store" });
                if (active && res.ok) {
                    const d = await res.json();
                    setLogo(typeof d?.images?.logo === "string" ? d.images.logo : "");
                    setNavbarStyle(isNavbarStyle(d?.branding?.navbarStyle) ? d.branding.navbarStyle : "serif");
                }
            } catch {
                /* ignorieren */
            }
            if (active) {
                const hidden = typeof document !== "undefined" && document.visibilityState === "hidden";
                timer = setTimeout(tick, hidden ? 30000 : 12000);
            }
        };
        tick();
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, []);

    return (
        <>
            {/* SCROLL LINE – ohne Transition, direkt am Scroll (GPU-Transform) */}
            <div className="fixed top-0 left-0 w-full h-[6px] bg-transparent z-[60]">
                <div
                    className="h-full w-full origin-left bg-[#C8A24A] will-change-transform"
                    style={{ transform: `scaleX(${scrollProgress})` }}
                />
            </div>

            {/* NAVBAR */}
            <header className="fixed top-6 left-0 w-full z-50 flex justify-center px-4">

                <div className="
                    w-full max-w-5xl
                    flex items-center justify-between
                    px-6 md:px-10 py-3
                    rounded-full
                    backdrop-blur-xl
                    bg-white/20
                    border border-black/5
                ">

                    {/* LOGO */}
                    <Link href="/" aria-label="Zur Startseite" className="flex items-center">
                        {logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logo} alt="RomaBeautyAcademy" className="h-8 md:h-9 w-auto" />
                        ) : (
                            <Wordmark style={navbarStyle} />
                        )}
                    </Link>

                    {/* DESKTOP MENU */}
                    <nav className="hidden md:flex gap-10 text-sm text-gray-600">
                        <Link href="/" className="hover:text-[#C8A24A] transition">Home</Link>
                        <Link href="#services" className="hover:text-[#C8A24A] transition">Services</Link>
                        <Link href="/about" className="hover:text-[#C8A24A] transition">About</Link>
                    </nav>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-3">

                        <Link href="/booking" className="px-5 py-2 rounded-full bg-[#C8A24A] text-black text-sm hover:scale-[1.05] transition">
                            Book
                        </Link>

                        {/* MOBILE BUTTON */}
                        <button
                            onClick={() => setOpen(!open)}
                            aria-label={open ? "Menü schließen" : "Menü öffnen"}
                            aria-expanded={open}
                            className="md:hidden text-2xl text-gray-700"
                        >
                            ☰
                        </button>

                    </div>

                </div>
            </header>

            {/*  MOBILE MENU */}
            {open && (
                <div className="fixed top-24 left-0 w-full z-50 flex justify-center px-4 md:hidden">

                    <div className="
                        w-full max-w-5xl
                        bg-white/80
                        backdrop-blur-xl
                        border border-black/10
                        rounded-2xl
                        shadow-lg
                        p-6
                    ">

                        <div className="flex flex-col gap-5 text-gray-700">

                            <Link href="/" onClick={() => setOpen(false)} className="hover:text-[#C8A24A]">
                                Home
                            </Link>

                            <Link href="#services" onClick={() => setOpen(false)} className="hover:text-[#C8A24A]">
                                Services
                            </Link>

                            <Link href="/about" onClick={() => setOpen(false)} className="hover:text-[#C8A24A]">
                                About
                            </Link>

                            <Link href="/booking" onClick={() => setOpen(false)} className="hover:text-[#C8A24A]">
                                Contact
                            </Link>

                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

/** Wählbare, lebendige Wortmarke (Gold-Schimmer dauerhaft über .wordmark-gold). */
export function Wordmark({ style }: { style: NavbarStyle }) {
    if (style === "script") {
        return (
            <span className="flex items-baseline gap-2">
                <span
                    className="wordmark-gold"
                    style={{ fontFamily: "var(--font-greatvibes), cursive", fontSize: "30px", lineHeight: 0.85 }}
                >
                    Roma Beauty
                </span>
                <span
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                    className="text-[11px] font-semibold tracking-[0.4em] text-[#0B0B0B]"
                >
                    ACADEMY
                </span>
            </span>
        );
    }
    if (style === "modern") {
        return (
            <span className="flex flex-col leading-[1.05]" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
                <span className="wordmark-gold text-lg md:text-xl font-semibold tracking-[0.22em]">ROMABEAUTY</span>
                <span className="mt-0.5 text-[10px] md:text-[11px] font-medium tracking-[0.5em] text-[#0B0B0B]">ACADEMY</span>
            </span>
        );
    }
    // serif (Standard)
    return (
        <span className="flex flex-col leading-none">
            <span
                className="wordmark-gold text-lg md:text-xl font-bold"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
                RomaBeauty
            </span>
            <span className="mt-[3px] pl-[2px] text-[8px] md:text-[9px] font-medium tracking-[0.5em] text-[#0B0B0B]">
                ACADEMY
            </span>
        </span>
    );
}