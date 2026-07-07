// Serverseitiges Auslesen der Admin-Sprache aus dem Cookie.
// Für Server-Komponenten (Admin-Seiten), die Texte direkt rendern.
import { cookies } from "next/headers";
import { ADMIN_LANG_COOKIE, isAdminLang, translate, type AdminLang } from "./admin";

export async function getAdminLang(): Promise<AdminLang> {
    const value = (await cookies()).get(ADMIN_LANG_COOKIE)?.value;
    return isAdminLang(value) ? value : "de";
}

/** Liefert Sprache + gebundene Übersetzungsfunktion für Server-Komponenten. */
export async function getAdminT(): Promise<{ lang: AdminLang; t: (key: string) => string }> {
    const lang = await getAdminLang();
    return { lang, t: (key: string) => translate(lang, key) };
}
