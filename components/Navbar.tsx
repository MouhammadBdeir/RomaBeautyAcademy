"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;

            setScrollProgress((scrollTop / docHeight) * 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            {/* 🔥 SCROLL LINE */}
            <div className="fixed top-0 left-0 w-full h-[8px] bg-transparent z-[60]">
                <div
                    className="h-full bg-[#C8A24A] transition-all duration-150"
                    style={{ width: `${scrollProgress}%` }}
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
                    <div className="tracking-[0.25em] font-bold text-sm md:text-base ">
                        <span className="text-[#C8A24A]  font-medium ">RomaBeauty</span>Academy
                    </div>

                    {/* DESKTOP MENU */}
                    <nav className="hidden md:flex gap-10 text-sm text-gray-600">
                        <Link href="/" className="hover:text-[#C8A24A] transition">Home</Link>
                        <Link href="#services" className="hover:text-[#C8A24A] transition">Services</Link>
                        <Link href="/about" className="hover:text-[#C8A24A] transition">About</Link>
                        <Link  href="/booking" className="hover:text-[#C8A24A] transition">Contact</Link>
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