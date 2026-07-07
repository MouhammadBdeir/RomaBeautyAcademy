"use client";

// Sprach-Umschalter (DE ↔ AR) für den Admin-Bereich. Schreibt die Wahl in ein
// Cookie und lädt die Server-Komponenten neu (router.refresh), damit sofort
// alle Texte + die Schreibrichtung (RTL für Arabisch) umgestellt werden.
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ADMIN_LANG_COOKIE, ADMIN_LANGS, ADMIN_LANG_LABEL, type AdminLang } from "@/lib/i18n/admin";
import { useT } from "./AdminI18nProvider";

export default function LanguageSwitcher() {
    const { lang, t } = useT();
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    function choose(next: AdminLang) {
        if (next === lang) return;
        document.cookie = `${ADMIN_LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        startTransition(() => router.refresh());
    }

    return (
        <div
            role="group"
            aria-label={t("Sprache")}
            className={`inline-flex items-center rounded-full border border-black/10 p-0.5 text-xs ${pending ? "opacity-60" : ""}`}
        >
            {ADMIN_LANGS.map((l) => (
                <button
                    key={l}
                    type="button"
                    onClick={() => choose(l)}
                    aria-pressed={lang === l}
                    className={`rounded-full px-2.5 py-1 font-medium transition ${
                        lang === l ? "bg-[#C8A24A] text-black" : "text-gray-500 hover:text-[#0B0B0B]"
                    }`}
                >
                    {ADMIN_LANG_LABEL[l]}
                </button>
            ))}
        </div>
    );
}
