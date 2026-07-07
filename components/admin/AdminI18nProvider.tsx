"use client";

// Stellt Client-Komponenten im Admin-Bereich die aktive Sprache + t() bereit.
// Die Sprache kommt vom Server (Layout liest das Cookie) und wird hier als
// Prop hereingereicht, damit Server und Client identisch übersetzen.
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { translate, type AdminLang } from "@/lib/i18n/admin";

type Ctx = { lang: AdminLang; t: (key: string) => string };

const AdminI18nContext = createContext<Ctx>({ lang: "de", t: (k) => k });

export function AdminI18nProvider({ lang, children }: { lang: AdminLang; children: ReactNode }) {
    const value = useMemo<Ctx>(() => ({ lang, t: (key: string) => translate(lang, key) }), [lang]);
    return <AdminI18nContext.Provider value={value}>{children}</AdminI18nContext.Provider>;
}

export function useT(): Ctx {
    return useContext(AdminI18nContext);
}
