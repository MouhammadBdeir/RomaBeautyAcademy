"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

const LINKS = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/media", label: "Medien" },
];

export default function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function logout() {
        setLoading(true);
        await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
        await signOut(auth).catch(() => {});
        router.push("/admin/login");
        router.refresh();
    }

    return (
        <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-8">
                    <Link href="/admin" className="tracking-[0.25em] font-bold text-sm">
                        <span className="text-[#C8A24A] font-medium">RomaBeauty</span>Academy
                    </Link>
                    <nav className="flex gap-6 text-sm">
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

                <button
                    onClick={logout}
                    disabled={loading}
                    className="px-4 py-2 rounded-full border border-black/10 text-sm hover:border-[#C8A24A] transition disabled:opacity-50"
                >
                    {loading ? "Abmelden …" : "Abmelden"}
                </button>
            </div>
        </header>
    );
}
