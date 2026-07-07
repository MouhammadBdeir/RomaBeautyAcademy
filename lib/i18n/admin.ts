// Zweisprachigkeit im Admin-Bereich (Deutsch ↔ Arabisch).
// Nur der Admin-Bereich ist umschaltbar; die öffentliche Seite bleibt Deutsch.
//
// Schlüssel = der deutsche Originaltext. Fehlt eine Übersetzung, wird der
// deutsche Text angezeigt (sanfter Fallback). Deshalb muss NICHT jeder String
// im Wörterbuch stehen – nur die, die auf Arabisch anders lauten.
//
// Client + Server nutzen dieselbe translate()-Funktion. Die aktuelle Sprache
// steckt in einem Cookie (siehe admin-server.ts + LanguageSwitcher).

export type AdminLang = "de" | "ar";

export const ADMIN_LANGS: AdminLang[] = ["de", "ar"];
export const ADMIN_LANG_COOKIE = "admin_lang";
export const ADMIN_LANG_LABEL: Record<AdminLang, string> = { de: "DE", ar: "AR" };

export function isAdminLang(v: unknown): v is AdminLang {
    return v === "de" || v === "ar";
}

export function dirFor(lang: AdminLang): "rtl" | "ltr" {
    return lang === "ar" ? "rtl" : "ltr";
}

// Arabische Übersetzungen, Schlüssel = deutscher Originaltext.
const AR: Record<string, string> = {
    // Navigation
    Dashboard: "لوحة التحكم",
    Buchungen: "الحجوزات",
    Medien: "الوسائط",
    Kontakt: "معلومات التواصل",
    "E-Mails": "الرسائل",
    Einstellungen: "الإعدادات",
    Abmelden: "تسجيل الخروج",
    "Abmelden …": "جارٍ تسجيل الخروج …",
    "Menü öffnen": "فتح القائمة",
    "Menü schließen": "إغلاق القائمة",
    Sprache: "اللغة",

    // Dashboard
    "Willkommen,": "مرحباً،",
    Admin: "مشرف",
    Owner: "المالك",
    "Bilder & Galerie verwalten →": "إدارة الصور والمعرض ←",
    "Benachrichtigungen & E-Mails": "الإشعارات والرسائل",
    "Speicher & Kosten": "التخزين والتكاليف",
    Benutzer: "المستخدمون",
    "Firebase Storage – Nutzung und grobe Kostenschätzung.":
        "تخزين Firebase – الاستخدام وتقدير تقريبي للتكاليف.",
    Dateien: "الملفات",
    "belegter Speicher": "المساحة المستخدمة",
    "geschätzt / Monat": "تقديري / شهرياً",
    "Schätzung nur für Speicherung (~$0,026 / GB·Monat). Download-Traffic ist nicht enthalten – die genaue Abrechnung siehst du in der Firebase Console.":
        "التقدير للتخزين فقط (~0.026$ لكل غيغابايت شهرياً). لا يشمل بيانات التنزيل – تجد الفاتورة الدقيقة في وحدة تحكم Firebase.",
    "Zur Nutzungsübersicht ↗": "عرض الاستخدام ↗",
    "Speichernutzung nicht verfügbar – ist Firebase Storage im Projekt aktiviert?":
        "بيانات التخزين غير متوفرة – هل تم تفعيل Firebase Storage في المشروع؟",
    "Alle Konten. Neue Registrierungen gibst du hier frei oder lehnst sie ab.":
        "جميع الحسابات. تُوافق على التسجيلات الجديدة أو ترفضها من هنا.",
    "Alle Admin-Konten.": "جميع حسابات المشرفين.",

    // Buchungen (Seite)
    "Terminanfragen verwalten – im Kalender einen Tag wählen, dann bestätigen oder absagen (auch nach der Bestätigung änderbar).":
        "إدارة طلبات المواعيد – اختر يوماً في التقويم ثم أكِّد أو ألغِ (قابل للتعديل حتى بعد التأكيد).",
};

const DICT: Record<AdminLang, Record<string, string>> = { de: {}, ar: AR };

/** Übersetzt einen deutschen Text in die aktive Sprache (Fallback: Deutsch). */
export function translate(lang: AdminLang, key: string): string {
    if (lang === "de") return key;
    return DICT[lang]?.[key] ?? key;
}
