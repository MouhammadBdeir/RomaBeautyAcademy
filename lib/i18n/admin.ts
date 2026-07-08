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

    // Einstellungen (Seite + SettingsManager)
    "Konten, Buchung, Benachrichtigungen, Wartung, Passwort und Protokoll.":
        "الحسابات، الحجز، الإشعارات، الصيانة، كلمة المرور والسجل.",
    Konten: "الحسابات",
    "Maximale Anzahl an Admin-Konten. Ist die Grenze erreicht, sind keine neuen Registrierungen mehr möglich.":
        "الحد الأقصى لعدد حسابات المشرفين. عند بلوغ الحد لا يمكن إجراء تسجيلات جديدة.",
    "0 = unbegrenzt": "0 = غير محدود",
    Buchung: "الحجز",
    "Samstage sperren": "حظر أيام السبت",
    "Kunden können samstags keinen Termin buchen.": "لا يمكن للعملاء الحجز أيام السبت.",
    "Sonntage sperren": "حظر أيام الأحد",
    "Kunden können sonntags keinen Termin buchen.": "لا يمكن للعملاء الحجز أيام الأحد.",
    "Feiertage sperren": "حظر أيام العطل الرسمية",
    "An gesetzlichen Feiertagen ist keine Buchung möglich.": "لا يمكن الحجز في أيام العطل الرسمية.",
    "Urlaub / geschlossene Zeiträume": "الإجازات / الفترات المغلقة",
    "In diesen Zeiträumen ist keine Buchung möglich.": "لا يمكن الحجز في هذه الفترات.",
    "+ Zeitraum": "+ فترة",
    "Kein Urlaub eingetragen.": "لا توجد إجازات مُدخلة.",
    Von: "من",
    Bis: "إلى",
    Bezeichnung: "الوصف",
    "z. B. Betriebsurlaub": "مثال: إجازة العمل",
    Entfernen: "إزالة",
    entfernen: "إزالة",
    "Benachrichtigungs-Empfänger": "مستلمو الإشعارات",
    "Diese Adressen bekommen bei jeder neuen Terminanfrage zusätzlich zur Owner-Adresse eine E-Mail.":
        "تتلقى هذه العناوين رسالة عند كل طلب موعد جديد، إضافةً إلى عنوان المالك.",
    Hinzufügen: "إضافة",
    "Bitte eine gültige E-Mail-Adresse eingeben.": "يرجى إدخال عنوان بريد إلكتروني صحيح.",
    Seite: "الموقع",
    Wartungsmodus: "وضع الصيانة",
    "Wirkt sofort: alle Besucher sehen die Wartungsseite. Verwaltet wird die Seite weiter über den Admin-Bereich.":
        "يؤثر فوراً: يرى جميع الزوار صفحة الصيانة. تبقى إدارة الموقع عبر لوحة التحكم.",
    "Wartungsmodus ist aktiv – Besucher sehen jetzt die Wartungsseite.":
        "وضع الصيانة مُفعّل – يرى الزوار الآن صفحة الصيانة.",
    "Wartungsmodus ist aus.": "وضع الصيانة مُطفأ.",
    "Konnte nicht geändert werden.": "تعذّر التغيير.",
    Deutsch: "الألمانية",
    "Weitere Sprachen folgen – aktuell ist die Seite auf Deutsch.":
        "ستتوفر لغات أخرى لاحقاً – حالياً الموقع بالألمانية.",
    "Aus Sicherheit muss jede Änderung vom Owner per E-Mail bestätigt werden, bevor sie aktiv wird.":
        "لأسباب أمنية، يجب أن يؤكّد المالك كل تغيير عبر البريد الإلكتروني قبل أن يصبح فعّالاً.",
    "Senden …": "جارٍ الإرسال …",
    "Speichern & zur Bestätigung senden": "حفظ وإرسال للتأكيد",
    "Bestätigungs-E-Mail an den Owner gesendet. Die Änderung wird erst nach Klick auf den Link aktiv.":
        "تم إرسال رسالة تأكيد إلى المالك. لن يصبح التغيير فعّالاً إلا بعد النقر على الرابط.",
    "Speichern fehlgeschlagen.": "فشل الحفظ.",
    // Passwort
    "Passwort ändern": "تغيير كلمة المرور",
    "Aus Sicherheitsgründen läuft die Änderung ausschließlich über einen Link per E-Mail an deine Admin-Adresse.":
        "لأسباب أمنية، يتم التغيير حصراً عبر رابط يُرسَل بالبريد إلى عنوان المشرف الخاص بك.",
    "Passwort-Link per E-Mail senden": "إرسال رابط كلمة المرور بالبريد",
    "Nicht angemeldet. Bitte neu einloggen und erneut versuchen.":
        "غير مسجّل الدخول. يرجى تسجيل الدخول من جديد والمحاولة مرة أخرى.",
    "Link zum Zurücksetzen gesendet an": "تم إرسال رابط إعادة التعيين إلى",
    // Protokoll
    Protokoll: "السجل",
    "Lädt …": "جارٍ التحميل …",
    Aktualisieren: "تحديث",
    Alle: "الكل",
    "Keine Einträge.": "لا توجد إدخالات.",
    // Log-Kategorien
    "E-Mail": "بريد إلكتروني",
    System: "النظام",
    // Entwickler
    "Hilfe & Entwickler": "المساعدة والمطوّر",
    "Technisches Problem oder eine Änderung gewünscht?": "مشكلة تقنية أو ترغب بتعديل؟",
    "Entwickler kontaktieren ↗": "تواصل مع المطوّر ↗",
    Kopieren: "نسخ",
    "Kopiert ✓": "تم النسخ ✓",
    "Falls sich dein E-Mail-Programm nicht öffnet, kopiere einfach die Adresse.":
        "إذا لم يفتح برنامج البريد لديك، فانسخ العنوان ببساطة.",

    // Kontaktdaten (Seite + ContactEditor)
    Kontaktdaten: "بيانات التواصل",
    "Diese Angaben erscheinen im Footer, auf der Buchungsseite und im Impressum – live, sobald du speicherst.":
        "تظهر هذه البيانات في التذييل وصفحة الحجز والبيانات القانونية – فوراً بمجرد الحفظ.",
    Telefon: "الهاتف",
    "Straße & Nr.": "الشارع والرقم",
    PLZ: "الرمز البريدي",
    Ort: "المدينة",
    Land: "البلد",
    "Rechtliches (Impressum)": "المعلومات القانونية (Impressum)",
    "Erscheint auf der Impressum-Seite.": "تظهر في صفحة البيانات القانونية.",
    Geschäftsführer: "المدير",
    Registergericht: "محكمة السجل",
    Handelsregisternummer: "رقم السجل التجاري",
    "USt-IdNr.": "الرقم الضريبي",
    "Social Media": "وسائل التواصل الاجتماعي",
    "+ Hinzufügen": "+ إضافة",
    "Noch keine Links. Beliebig viele möglich (Instagram, TikTok, Facebook, WhatsApp …).":
        "لا توجد روابط بعد. يمكنك إضافة أي عدد (إنستغرام، تيك توك، فيسبوك، واتساب …).",
    Name: "الاسم",
    Link: "الرابط",
    "Speichern …": "جارٍ الحفظ …",
    Speichern: "حفظ",
    "Gespeichert ✓": "تم الحفظ ✓",

    // E-Mail-Vorlagen (Seite + Manager + TEMPLATE_META/PLACEHOLDER_LABELS)
    "E-Mail-Vorlagen": "قوالب البريد الإلكتروني",
    "Diese E-Mails verschickt die Seite automatisch. Betreff und Text kannst du frei anpassen – Design (Logo & Farben) und die Kontaktdaten im Fußbereich kommen automatisch aus deinen Kontaktdaten.":
        "يرسل الموقع هذه الرسائل تلقائياً. يمكنك تعديل الموضوع والنص بحرية – أما التصميم (الشعار والألوان) وبيانات التواصل في التذييل فتُؤخَذ تلقائياً من بيانات التواصل الخاصة بك.",
    Vorlagen: "القوالب",
    "An Kunden": "إلى العملاء",
    "An Studio": "إلى الاستوديو",
    deaktiviert: "مُعطّل",
    Aktiv: "مُفعّل",
    Aus: "مُطفأ",
    "Vorlage deaktivieren": "تعطيل القالب",
    "Vorlage aktivieren": "تفعيل القالب",
    Betreff: "الموضوع",
    "Betreff:": "الموضوع:",
    Text: "النص",
    "Platzhalter einfügen (klicken) – werden beim Versand automatisch ersetzt:":
        "أدرج العناصر النائبة (بالنقر) – تُستبدَل تلقائياً عند الإرسال:",
    Vorschau: "المعاينة",
    Beispieldaten: "بيانات تجريبية",
    "E-Mail-Vorschau": "معاينة البريد",
    // TEMPLATE_META – Titel
    "Terminanfrage erhalten": "تم استلام طلب الموعد",
    "Termin bestätigt": "تم تأكيد الموعد",
    "Termin abgesagt": "تم إلغاء الموعد",
    "Termin-Erinnerung": "تذكير بالموعد",
    "Benachrichtigung ans Studio": "إشعار إلى الاستوديو",
    // TEMPLATE_META – Beschreibungen
    "Geht sofort an den Kunden, sobald er über /booking eine Anfrage abschickt.":
        "يُرسَل فوراً إلى العميل بمجرد إرساله طلباً عبر /booking.",
    "Geht an den Kunden, sobald du eine Buchung bestätigst.":
        "يُرسَل إلى العميل بمجرد تأكيدك للحجز.",
    "Geht an den Kunden, sobald du eine Buchung absagst.":
        "يُرسَل إلى العميل بمجرد إلغائك للحجز.",
    "Geht automatisch einen Tag vor dem Termin an den Kunden – nur bei bestätigten Terminen.":
        "يُرسَل تلقائياً قبل يوم من الموعد إلى العميل – فقط للمواعيد المؤكَّدة.",
    "Interne Info an dich bei jeder neuen Terminanfrage.":
        "معلومة داخلية لك عند كل طلب موعد جديد.",
    // PLACEHOLDER_LABELS
    "Name des Kunden": "اسم العميل",
    "Datum (TT.MM.JJJJ)": "التاريخ (يوم.شهر.سنة)",
    Uhrzeit: "الوقت",
    "Telefon des Kunden": "هاتف العميل",
    "E-Mail des Kunden": "بريد العميل",
    "Nachricht des Kunden": "رسالة العميل",
    "Gewünschter Service": "الخدمة المطلوبة",
    "Anzahl Personen": "عدد الأشخاص",
    "Name des Studios": "اسم الاستوديو",
    "E-Mail des Studios": "بريد الاستوديو",
    "Telefon des Studios": "هاتف الاستوديو",
    "Adresse des Studios": "عنوان الاستوديو",
    "Link zur Buchungsverwaltung": "رابط إدارة الحجوزات",

    // BookingsManager (Kalender + Tabelle)
    // Monate
    Januar: "يناير",
    Februar: "فبراير",
    März: "مارس",
    April: "أبريل",
    Mai: "مايو",
    Juni: "يونيو",
    Juli: "يوليو",
    August: "أغسطس",
    September: "سبتمبر",
    Oktober: "أكتوبر",
    November: "نوفمبر",
    Dezember: "ديسمبر",
    // Wochentage (Kürzel)
    Mo: "إث",
    Di: "ثل",
    Mi: "أر",
    Do: "خم",
    Fr: "جم",
    Sa: "سب",
    So: "أح",
    // Status
    Offen: "قيد الانتظار",
    Bestätigt: "مؤكَّد",
    Abgesagt: "مُلغى",
    // Filter + Kalender
    "Alle Reservierungen": "كل الحجوزات",
    Heute: "اليوم",
    Morgen: "غداً",
    "Reservierungen am": "حجوزات يوم",
    "Vorheriger Monat": "الشهر السابق",
    "Nächster Monat": "الشهر التالي",
    "Zahl = Reservierungen am Tag. Grau = geschlossen.":
        "الرقم = عدد الحجوزات في اليوم. الرمادي = مغلق.",
    "Keine Buchungen.": "لا توجد حجوزات.",
    // Tabelle
    Termin: "الموعد",
    Kunde: "العميل",
    Status: "الحالة",
    Aktionen: "الإجراءات",
    Uhr: "",
    Personen: "أشخاص",
    // Erinnerung
    "Erinnerung gesendet": "تم إرسال التذكير",
    "nicht gesendet": "لم يُرسَل",
    "Erneut senden": "إعادة الإرسال",
    "Jetzt senden": "إرسال الآن",
    "Gesendet:": "أُرسِل:",
    "gerade eben": "الآن",
    // Aktionen
    Abbrechen: "إلغاء",
    Bestätigen: "تأكيد",
    Absagen: "رفض",
    Reaktivieren: "إعادة التفعيل",
    Verschieben: "نقل",
    Löschen: "حذف",
    // Dialoge
    "Buchung bestätigen?": "تأكيد الحجز؟",
    "Buchung absagen?": "رفض الحجز؟",
    "Buchung reaktivieren?": "إعادة تفعيل الحجز؟",
    "Buchung löschen?": "حذف الحجز؟",
    "Termin verschieben?": "نقل الموعد؟",
    "Erinnerung jetzt senden?": "إرسال التذكير الآن؟",
    "Neuer Termin:": "الموعد الجديد:",
    "Was soll mit der Benachrichtigung passieren?": "ماذا تريد أن يحدث للإشعار؟",
    "Bestätigen & Benachrichtigung archivieren": "تأكيد وأرشفة الإشعار",
    "Bestätigen & Benachrichtigung löschen": "تأكيد وحذف الإشعار",
    "Löschen & Benachrichtigung archivieren": "حذف وأرشفة الإشعار",
    "Löschen & Benachrichtigung entfernen": "حذف وإزالة الإشعار",
    Senden: "إرسال",
    // Fehler
    "Etwas ist schiefgelaufen.": "حدث خطأ ما.",
    "Fehlgeschlagen.": "فشل.",
    "Bitte Datum und Uhrzeit wählen.": "يرجى اختيار التاريخ والوقت.",
    "Löschen fehlgeschlagen.": "فشل الحذف.",
    "Senden fehlgeschlagen.": "فشل الإرسال.",

    // NotificationsPanel
    Benachrichtigungen: "الإشعارات",
    "Aktive anzeigen": "عرض النشطة",
    "Archiv anzeigen": "عرض الأرشيف",
    Live: "مباشر",
    "Kein Archiv vorhanden.": "لا يوجد أرشيف.",
    "Keine neuen Benachrichtigungen.": "لا توجد إشعارات جديدة.",
    ungelesen: "غير مقروء",
    Archiviert: "مؤرشَف",
    "Termin:": "الموعد:",
    "Zur Buchung →": "إلى الحجز ←",
    Wiederherstellen: "استعادة",
    Archivieren: "أرشفة",
    "Benachrichtigung löschen?": "حذف الإشعار؟",
    "Solange die Anfrage offen ist, kann sie nicht gelöscht werden. Bestätige oder sage den Termin zuerst ab.":
        "لا يمكن حذف الطلب ما دام مفتوحاً. أكِّد الموعد أو ألغِه أولاً.",
    "Archivieren fehlgeschlagen.": "فشلت الأرشفة.",
    "Wiederherstellen fehlgeschlagen.": "فشلت الاستعادة.",

    // UsersTable
    Rolle: "الدور",
    Registriert: "تاريخ التسجيل",
    "Letzter Login": "آخر تسجيل دخول",
    "Keine Benutzer gefunden.": "لم يتم العثور على مستخدمين.",
    Freigeben: "قبول",
    Ablehnen: "رفض",
    "Wartet auf Freigabe": "بانتظار الموافقة",
    "Passwort zurücksetzen": "إعادة تعيين كلمة المرور",
    "Rechte entziehen": "سحب الصلاحيات",
    "Konto freigeben?": "قبول الحساب؟",
    "Anfrage ablehnen?": "رفض الطلب؟",
    "Passwort zurücksetzen?": "إعادة تعيين كلمة المرور؟",
    "Admin-Rechte entziehen?": "سحب صلاحيات المشرف؟",
    "Konto endgültig löschen?": "حذف الحساب نهائياً؟",
    "Erhält damit vollen Zugriff auf den Admin-Bereich.": "سيحصل بذلك على وصول كامل إلى لوحة التحكم.",
    "Die Registrierung wird abgelehnt und das Konto gelöscht.": "سيُرفض التسجيل ويُحذف الحساب.",
    "Es wird ein Link zum Zurücksetzen erstellt bzw. per E-Mail gesendet.":
        "سيتم إنشاء رابط لإعادة التعيين أو إرساله بالبريد.",
    "Verliert den Zugriff auf den Admin-Bereich.": "سيفقد الوصول إلى لوحة التحكم.",
    "Wird unwiderruflich gelöscht. Das kann nicht rückgängig gemacht werden.":
        "سيُحذف نهائياً. لا يمكن التراجع عن ذلك.",
    Zurücksetzen: "إعادة التعيين",
    Entziehen: "سحب",
    "Aktion fehlgeschlagen.": "فشل الإجراء.",
    "Passwort-Reset-Link wurde per E-Mail an den Benutzer gesendet.":
        "تم إرسال رابط إعادة تعيين كلمة المرور إلى المستخدم بالبريد.",
    "Kein SMTP konfiguriert – Reset-Link manuell weitergeben:":
        "لم يُضبط SMTP – مرّر رابط إعادة التعيين يدوياً:",

    // Login / Registrierung
    Anmelden: "تسجيل الدخول",
    "Anmelden …": "جارٍ تسجيل الدخول …",
    Registrieren: "التسجيل",
    "Registrieren …": "جارٍ التسجيل …",
    Passwort: "كلمة المرور",
    Einloggen: "تسجيل الدخول",
    "Admin Login": "دخول المشرف",
    "Bitte melde dich an.": "يرجى تسجيل الدخول.",
    "Noch kein Konto?": "لا تملك حساباً؟",
    "Login fehlgeschlagen.": "فشل تسجيل الدخول.",
    "Admin Registrierung": "تسجيل المشرف",
    "Deine Registrierung ist eingegangen. Ein Owner muss dein Konto freigeben, bevor du dich einloggen kannst.":
        "تم استلام تسجيلك. يجب أن يوافق المالك على حسابك قبل أن تتمكن من تسجيل الدخول.",
    "Zum Login": "إلى تسجيل الدخول",
    "Mindestens 6 Zeichen.": "6 أحرف على الأقل.",
    "Schon ein Konto?": "لديك حساب بالفعل؟",
    "Registrierung fehlgeschlagen.": "فشل التسجيل.",

    // Medien (Seite + MediaWorkspace)
    "Homepage & Medien": "الصفحة الرئيسية والوسائط",
    "Links siehst du die Startseite von oben nach unten. Sektion anklicken, um ihre Bilder zu bearbeiten – mit dem Schalter blendest du eine Sektion ein oder aus. Alles wird live übernommen.":
        "على اليمين ترى الصفحة الرئيسية من الأعلى إلى الأسفل. انقر على قسم لتعديل صوره – وبالمفتاح تُظهر القسم أو تُخفيه. يُطبَّق كل شيء مباشرةً.",
};

const DICT: Record<AdminLang, Record<string, string>> = { de: {}, ar: AR };

/** Übersetzt einen deutschen Text in die aktive Sprache (Fallback: Deutsch). */
export function translate(lang: AdminLang, key: string): string {
    if (lang === "de") return key;
    return DICT[lang]?.[key] ?? key;
}
