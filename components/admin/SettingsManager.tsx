"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { mapFirebaseError } from "@/lib/auth/firebase-errors";
import { type SiteSettings, type Vacation } from "@/lib/settings/types";
import { CATEGORY_LABEL, type LogCategory, type LogEntry } from "@/lib/logs/types";
import { useT } from "./AdminI18nProvider";

// Entwickler-Kontaktadresse kommt aus der Umgebung (NEXT_PUBLIC_, da Client-Komponente).
// Nicht hardcodieren. Ist sie nicht gesetzt, wird der Kontakt-Abschnitt ausgeblendet.
const DEVELOPER_EMAIL = process.env.NEXT_PUBLIC_DEVELOPER_EMAIL ?? "";

function uid(): string {
    return Math.random().toString(36).slice(2, 9);
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={label}
            onClick={onClick}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-[#C8A24A]" : "bg-gray-300"}`}
        >
            <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`}
            />
        </button>
    );
}

const inputCls = "w-full rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-[#C8A24A]";

export default function SettingsManager({ initial, logs }: { initial: SiteSettings; logs: LogEntry[] }) {
    const { t } = useT();
    const [data, setData] = useState<SiteSettings>(initial);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ccInput, setCcInput] = useState("");
    const [maint, setMaint] = useState<{ text: string; ok: boolean } | null>(null);

    function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
        setData((d) => ({ ...d, [key]: value }));
        setStatus(null);
    }

    function addVacation() {
        set("vacations", [...data.vacations, { id: uid(), from: "", to: "", label: "" }]);
    }
    function setVacation(id: string, patch: Partial<Vacation>) {
        set(
            "vacations",
            data.vacations.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        );
    }
    function removeVacation(id: string) {
        set(
            "vacations",
            data.vacations.filter((v) => v.id !== id),
        );
    }

    function addCc() {
        const e = ccInput.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
            setError(t("Bitte eine gültige E-Mail-Adresse eingeben."));
            return;
        }
        if (!data.ccEmails.includes(e)) set("ccEmails", [...data.ccEmails, e]);
        setCcInput("");
        setError(null);
    }
    function removeCc(e: string) {
        set(
            "ccEmails",
            data.ccEmails.filter((x) => x !== e),
        );
    }

    // Wartungsmodus wirkt sofort (separat von der bestätigungspflichtigen Speicherung).
    async function toggleMaintenance() {
        const next = !data.maintenanceMode;
        setData((d) => ({ ...d, maintenanceMode: next }));
        setMaint(null);
        try {
            const res = await fetch("/api/admin/maintenance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ on: next }),
            });
            if (!res.ok) throw new Error();
            setMaint({
                ok: true,
                text: next
                    ? t("Wartungsmodus ist aktiv – Besucher sehen jetzt die Wartungsseite.")
                    : t("Wartungsmodus ist aus."),
            });
        } catch {
            setData((d) => ({ ...d, maintenanceMode: !next }));
            setMaint({ ok: false, text: t("Konnte nicht geändert werden.") });
        }
    }

    async function save() {
        setSaving(true);
        setError(null);
        setStatus(null);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const d = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(d.error ?? t("Speichern fehlgeschlagen."));
            setStatus(t("Bestätigungs-E-Mail an den Owner gesendet. Die Änderung wird erst nach Klick auf den Link aktiv."));
        } catch (err) {
            setError(err instanceof Error ? err.message : t("Speichern fehlgeschlagen."));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* KONTEN-LIMIT */}
            <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-medium text-[#0B0B0B]">{t("Konten")}</h2>
                <p className="mt-1 text-sm text-gray-500">
                    {t("Maximale Anzahl an Admin-Konten. Ist die Grenze erreicht, sind keine neuen Registrierungen mehr möglich.")}
                </p>
                <div className="mt-4 flex items-center gap-3">
                    <input
                        type="number"
                        min={0}
                        value={data.maxAccounts}
                        onChange={(e) => set("maxAccounts", Math.max(0, Number(e.target.value) || 0))}
                        className="w-28 rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-[#C8A24A]"
                    />
                    <span className="text-sm text-gray-500">{t("0 = unbegrenzt")}</span>
                </div>
            </section>

            {/* BUCHUNG */}
            <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-medium text-[#0B0B0B]">{t("Buchung")}</h2>

                <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-[#0B0B0B]">{t("Samstage sperren")}</p>
                        <p className="text-sm text-gray-500">{t("Kunden können samstags keinen Termin buchen.")}</p>
                    </div>
                    <Toggle
                        on={data.blockSaturdays}
                        onClick={() => set("blockSaturdays", !data.blockSaturdays)}
                        label={t("Samstage sperren")}
                    />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-black/5 pt-4">
                    <div>
                        <p className="text-sm font-medium text-[#0B0B0B]">{t("Sonntage sperren")}</p>
                        <p className="text-sm text-gray-500">{t("Kunden können sonntags keinen Termin buchen.")}</p>
                    </div>
                    <Toggle
                        on={data.blockSundays}
                        onClick={() => set("blockSundays", !data.blockSundays)}
                        label={t("Sonntage sperren")}
                    />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-black/5 pt-4">
                    <div>
                        <p className="text-sm font-medium text-[#0B0B0B]">{t("Feiertage sperren")}</p>
                        <p className="text-sm text-gray-500">
                            {t("An gesetzlichen Feiertagen ist keine Buchung möglich.")}
                        </p>
                    </div>
                    <Toggle
                        on={data.blockHolidays}
                        onClick={() => set("blockHolidays", !data.blockHolidays)}
                        label={t("Feiertage sperren")}
                    />
                </div>

                <div className="mt-6 border-t border-black/5 pt-5">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#0B0B0B]">{t("Urlaub / geschlossene Zeiträume")}</p>
                            <p className="text-sm text-gray-500">{t("In diesen Zeiträumen ist keine Buchung möglich.")}</p>
                        </div>
                        <button
                            onClick={addVacation}
                            className="rounded-full bg-[#C8A24A] px-4 py-1.5 text-sm text-black transition hover:scale-[1.03]"
                        >
                            {t("+ Zeitraum")}
                        </button>
                    </div>

                    {data.vacations.length === 0 ? (
                        <p className="text-sm text-gray-400">{t("Kein Urlaub eingetragen.")}</p>
                    ) : (
                        <div className="space-y-3">
                            {data.vacations.map((v) => (
                                <div key={v.id} className="flex flex-wrap items-end gap-3">
                                    <label className="block">
                                        <span className="text-xs text-gray-500">{t("Von")}</span>
                                        <input
                                            type="date"
                                            value={v.from}
                                            onChange={(e) => setVacation(v.id, { from: e.target.value })}
                                            className="mt-1 block rounded-xl border border-black/10 p-2.5 text-sm outline-none focus:border-[#C8A24A]"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs text-gray-500">{t("Bis")}</span>
                                        <input
                                            type="date"
                                            value={v.to}
                                            min={v.from || undefined}
                                            onChange={(e) => setVacation(v.id, { to: e.target.value })}
                                            className="mt-1 block rounded-xl border border-black/10 p-2.5 text-sm outline-none focus:border-[#C8A24A]"
                                        />
                                    </label>
                                    <label className="block min-w-0 flex-1">
                                        <span className="text-xs text-gray-500">{t("Bezeichnung")}</span>
                                        <input
                                            value={v.label}
                                            placeholder={t("z. B. Betriebsurlaub")}
                                            onChange={(e) => setVacation(v.id, { label: e.target.value })}
                                            className="mt-1 w-full rounded-xl border border-black/10 p-2.5 text-sm outline-none focus:border-[#C8A24A]"
                                        />
                                    </label>
                                    <button
                                        onClick={() => removeVacation(v.id)}
                                        className="rounded-full border border-black/10 px-3 py-2.5 text-sm transition hover:border-red-400 hover:text-red-600"
                                    >
                                        {t("Entfernen")}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* BENACHRICHTIGUNGEN (CC) */}
            <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-medium text-[#0B0B0B]">{t("Benachrichtigungs-Empfänger")}</h2>
                <p className="mt-1 text-sm text-gray-500">
                    {t("Diese Adressen bekommen bei jeder neuen Terminanfrage zusätzlich zur Owner-Adresse eine E-Mail.")}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                    <input
                        type="email"
                        value={ccInput}
                        placeholder="name@beispiel.de"
                        onChange={(e) => setCcInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addCc();
                            }
                        }}
                        className="min-w-0 flex-1 rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-[#C8A24A]"
                    />
                    <button
                        onClick={addCc}
                        className="rounded-full bg-[#C8A24A] px-5 py-2 text-sm text-black transition hover:scale-[1.03]"
                    >
                        {t("Hinzufügen")}
                    </button>
                </div>

                {data.ccEmails.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {data.ccEmails.map((e) => (
                            <span
                                key={e}
                                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#F7F3EE] px-3 py-1 text-sm"
                            >
                                {e}
                                <button
                                    onClick={() => removeCc(e)}
                                    aria-label={`${e} ${t("entfernen")}`}
                                    className="text-gray-400 transition hover:text-red-600"
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </section>

            {/* WARTUNG & SPRACHE */}
            <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-medium text-[#0B0B0B]">{t("Seite")}</h2>

                <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-[#0B0B0B]">{t("Wartungsmodus")}</p>
                        <p className="text-sm text-gray-500">
                            {t("Wirkt sofort: alle Besucher sehen die Wartungsseite. Verwaltet wird die Seite weiter über den Admin-Bereich.")}
                        </p>
                        {maint && (
                            <p className={`mt-1 text-xs ${maint.ok ? "text-green-600" : "text-red-600"}`}>{maint.text}</p>
                        )}
                    </div>
                    <Toggle on={data.maintenanceMode} onClick={toggleMaintenance} label={t("Wartungsmodus")} />
                </div>

                <div className="mt-6 border-t border-black/5 pt-5">
                    <label className="block">
                        <span className="text-sm font-medium text-[#0B0B0B]">{t("Sprache")}</span>
                        <select disabled value="de" className={`${inputCls} mt-2 max-w-xs cursor-not-allowed bg-gray-50`}>
                            <option value="de">{t("Deutsch")}</option>
                        </select>
                    </label>
                    <p className="mt-1 text-xs text-gray-400">{t("Weitere Sprachen folgen – aktuell ist die Seite auf Deutsch.")}</p>
                </div>
            </section>

            {/* SPEICHERN (Einstellungen) – mit Owner-Bestätigung */}
            <div className="sticky bottom-4 space-y-2 rounded-2xl border border-black/10 bg-white/90 p-4 backdrop-blur">
                <p className="text-xs text-gray-500">
                    {t("Aus Sicherheit muss jede Änderung vom Owner per E-Mail bestätigt werden, bevor sie aktiv wird.")}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={save}
                        disabled={saving}
                        className="rounded-full bg-[#C8A24A] px-8 py-3 font-medium text-black transition hover:scale-[1.02] disabled:opacity-50"
                    >
                        {saving ? t("Senden …") : t("Speichern & zur Bestätigung senden")}
                    </button>
                    {status && <span className="text-sm text-green-600">{status}</span>}
                    {error && <span className="text-sm text-red-600">{error}</span>}
                </div>
            </div>

            {/* PASSWORT */}
            <PasswordChange />

            {/* LOGS */}
            <LogsViewer initial={logs} />

            {/* ENTWICKLER */}
            <DeveloperContact />
        </div>
    );
}

function PasswordChange() {
    const { t } = useT();
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    async function requestReset() {
        setErr(null);
        setMsg(null);
        const user = auth.currentUser;
        if (!user?.email) {
            setErr(t("Nicht angemeldet. Bitte neu einloggen und erneut versuchen."));
            return;
        }
        setBusy(true);
        try {
            await sendPasswordResetEmail(auth, user.email);
            setMsg(`${t("Link zum Zurücksetzen gesendet an")} ${user.email}`);
        } catch (e) {
            setErr(mapFirebaseError(e instanceof Error ? e.message : "Fehler."));
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-medium text-[#0B0B0B]">{t("Passwort ändern")}</h2>
            <p className="mt-1 text-sm text-gray-500">
                {t("Aus Sicherheitsgründen läuft die Änderung ausschließlich über einen Link per E-Mail an deine Admin-Adresse.")}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                    onClick={requestReset}
                    disabled={busy}
                    className="rounded-full bg-[#C8A24A] px-6 py-2.5 text-sm font-medium text-black transition hover:scale-[1.02] disabled:opacity-50"
                >
                    {busy ? t("Senden …") : t("Passwort-Link per E-Mail senden")}
                </button>
                {msg && <span className="text-sm text-green-600">{msg}</span>}
                {err && <span className="text-sm text-red-600">{err}</span>}
            </div>
        </section>
    );
}

const LEVEL_DOT: Record<string, string> = {
    info: "bg-gray-300",
    warn: "bg-amber-400",
    error: "bg-red-500",
};

const CAT_BADGE: Record<LogCategory, string> = {
    booking: "bg-[#C8A24A]/15 text-[#8a6d24]",
    admin: "bg-blue-100 text-blue-700",
    email: "bg-green-100 text-green-700",
    system: "bg-gray-100 text-gray-600",
};

function LogsViewer({ initial }: { initial: LogEntry[] }) {
    const { t } = useT();
    const [logs, setLogs] = useState<LogEntry[]>(initial);
    const [filter, setFilter] = useState<"all" | LogCategory>("all");
    const [busy, setBusy] = useState(false);

    async function refresh() {
        setBusy(true);
        try {
            const res = await fetch("/api/admin/logs?limit=200", { cache: "no-store" });
            if (res.ok) {
                const d = await res.json();
                if (Array.isArray(d.logs)) setLogs(d.logs);
            }
        } catch {
            /* ignorieren */
        } finally {
            setBusy(false);
        }
    }

    const shown = filter === "all" ? logs : logs.filter((l) => l.category === filter);
    const filters: ("all" | LogCategory)[] = ["all", "booking", "admin", "email", "system"];

    return (
        <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-medium text-[#0B0B0B]">{t("Protokoll")}</h2>
                <button
                    onClick={refresh}
                    disabled={busy}
                    className="rounded-full border border-black/10 px-4 py-1.5 text-sm transition hover:border-[#C8A24A] disabled:opacity-50"
                >
                    {busy ? t("Lädt …") : t("Aktualisieren")}
                </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-full px-3 py-1 text-xs transition ${
                            filter === f ? "bg-[#C8A24A] text-black" : "border border-black/10 hover:border-[#C8A24A]"
                        }`}
                    >
                        {f === "all" ? t("Alle") : t(CATEGORY_LABEL[f])}
                    </button>
                ))}
            </div>

            {shown.length === 0 ? (
                <p className="text-sm text-gray-500">{t("Keine Einträge.")}</p>
            ) : (
                <ul className="max-h-96 space-y-1 overflow-y-auto">
                    {shown.map((l) => (
                        <li key={l.id} className="flex items-start gap-3 rounded-lg px-2 py-2 text-sm hover:bg-black/5">
                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${LEVEL_DOT[l.level] ?? "bg-gray-300"}`} />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full px-2 py-0.5 text-xs ${CAT_BADGE[l.category]}`}>
                                        {t(CATEGORY_LABEL[l.category])}
                                    </span>
                                    {l.createdAt && <span className="text-xs text-gray-400">{l.createdAt}</span>}
                                    {l.actor && <span className="text-xs text-gray-400">· {l.actor}</span>}
                                </div>
                                <p className="mt-0.5 break-words text-[#0B0B0B]">{l.message}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function DeveloperContact() {
    const { t } = useT();
    const [copied, setCopied] = useState(false);

    // Ohne konfigurierte Adresse (NEXT_PUBLIC_DEVELOPER_EMAIL) nichts anzeigen.
    if (!DEVELOPER_EMAIL) return null;

    async function copy() {
        try {
            await navigator.clipboard.writeText(DEVELOPER_EMAIL);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }

    return (
        <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-medium text-[#0B0B0B]">{t("Hilfe & Entwickler")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("Technisches Problem oder eine Änderung gewünscht?")}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                    href={`mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent("RomaBeautyAcademy – Support")}`}
                    className="rounded-full bg-[#C8A24A] px-5 py-2 text-sm font-medium text-black transition hover:scale-[1.03]"
                >
                    {t("Entwickler kontaktieren ↗")}
                </a>
                <span className="select-all rounded-full border border-black/10 bg-[#F7F3EE] px-4 py-2 font-mono text-sm text-[#0B0B0B]">
                    {DEVELOPER_EMAIL}
                </span>
                <button
                    onClick={copy}
                    className="rounded-full border border-black/10 px-4 py-2 text-sm transition hover:border-[#C8A24A]"
                >
                    {copied ? t("Kopiert ✓") : t("Kopieren")}
                </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
                {t("Falls sich dein E-Mail-Programm nicht öffnet, kopiere einfach die Adresse.")}
            </p>
        </section>
    );
}
