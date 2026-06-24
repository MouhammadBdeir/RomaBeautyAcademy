"use client";

import { useState } from "react";
import { NAVBAR_STYLES, type NavbarStyle } from "@/lib/branding/types";
import { Wordmark } from "@/components/Navbar";

export default function NavbarStylePicker({ initial }: { initial: NavbarStyle }) {
    const [style, setStyle] = useState<NavbarStyle>(initial);
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);

    async function pick(next: NavbarStyle) {
        if (next === style || busy) return;
        const prev = style;
        setStyle(next);
        setBusy(true);
        setStatus(null);
        try {
            const res = await fetch("/api/admin/branding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ navbarStyle: next }),
            });
            if (!res.ok) throw new Error();
            setStatus({ ok: true, text: "Gespeichert ✓ – live auf der Seite" });
        } catch {
            setStyle(prev);
            setStatus({ ok: false, text: "Konnte nicht gespeichert werden." });
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="mb-6 rounded-2xl border border-black/10 bg-white p-5">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-[#0B0B0B]">Navbar-Stil</h3>
                {status && (
                    <span className={`text-xs ${status.ok ? "text-green-600" : "text-red-600"}`}>{status.text}</span>
                )}
            </div>
            <p className="mb-4 text-xs text-gray-500">
                Schriftzug der oberen Navigation – greift sofort live. Wird nur angezeigt, solange kein eigenes
                Logo-Bild hochgeladen ist. Der Gold-Schimmer bewegt sich dauerhaft.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
                {NAVBAR_STYLES.map((s) => {
                    const active = style === s.value;
                    return (
                        <button
                            key={s.value}
                            onClick={() => pick(s.value)}
                            disabled={busy}
                            aria-pressed={active}
                            className={`rounded-xl border p-4 text-left transition disabled:opacity-60 ${
                                active
                                    ? "border-[#C8A24A] bg-[#C8A24A]/5 ring-1 ring-[#C8A24A]"
                                    : "border-black/10 hover:border-[#C8A24A]/50"
                            }`}
                        >
                            <div className="flex min-h-[44px] items-center overflow-hidden">
                                <span className="origin-left scale-90">
                                    <Wordmark style={s.value} />
                                </span>
                            </div>
                            <p className="mt-3 text-sm font-medium text-[#0B0B0B]">{s.label}</p>
                            <p className="text-xs text-gray-500">{s.hint}</p>
                            {active && <p className="mt-1 text-xs font-medium text-[#C8A24A]">Aktiv</p>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
