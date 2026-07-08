"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContactData } from "@/lib/contact/types";
import {
    buildBookingVars,
    renderTemplate,
    PLACEHOLDER_LABELS,
    TEMPLATE_META,
    type BookingEmailData,
    type EmailTemplateKey,
    type EmailTemplates,
} from "@/lib/email/templates";
import { useT } from "./AdminI18nProvider";

// Beispieldaten nur für die Live-Vorschau.
const SAMPLE_BOOKING: BookingEmailData = {
    name: "Anna Müller",
    email: "anna.mueller@example.com",
    phone: "+49 151 23456789",
    date: "2026-07-15",
    time: "14:00",
    message: "Ich hätte gern einen Termin für eine Gesichtsbehandlung.",
};

export default function EmailTemplatesManager({
    initial,
    contact,
}: {
    initial: EmailTemplates;
    contact: ContactData;
}) {
    const { t } = useT();
    const router = useRouter();
    const [templates, setTemplates] = useState<EmailTemplates>(initial);
    const [selected, setSelected] = useState<EmailTemplateKey>("bookingReceived");
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const bodyRef = useRef<HTMLTextAreaElement>(null);

    const meta = TEMPLATE_META.find((m) => m.key === selected)!;
    const current = templates[selected];

    const previewVars = buildBookingVars(SAMPLE_BOOKING, contact);
    const preview = renderTemplate(current, previewVars, contact);

    function setField(field: "subject" | "body", value: string) {
        setTemplates((prev) => ({ ...prev, [selected]: { ...prev[selected], [field]: value } }));
        setStatus(null);
    }

    function toggleEnabled() {
        setTemplates((prev) => ({ ...prev, [selected]: { ...prev[selected], enabled: !prev[selected].enabled } }));
        setStatus(null);
    }

    function insertPlaceholder(token: string) {
        const snippet = `{{${token}}}`;
        const ta = bodyRef.current;
        if (!ta) {
            setField("body", current.body + snippet);
            return;
        }
        const start = ta.selectionStart ?? current.body.length;
        const end = ta.selectionEnd ?? current.body.length;
        setField("body", current.body.slice(0, start) + snippet + current.body.slice(end));
        requestAnimationFrame(() => {
            ta.focus();
            const pos = start + snippet.length;
            ta.setSelectionRange(pos, pos);
        });
    }

    async function save() {
        setSaving(true);
        setError(null);
        setStatus(null);
        try {
            const res = await fetch("/api/admin/email-templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(templates),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? t("Speichern fehlgeschlagen."));
            setStatus(t("Gespeichert ✓"));
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : t("Speichern fehlgeschlagen."));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                {/* LINKS: Vorlagen-Liste */}
                <div className="space-y-2 lg:sticky lg:top-20 self-start">
                    <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">{t("Vorlagen")}</p>
                    {TEMPLATE_META.map((m) => {
                        const tpl = templates[m.key];
                        const active = selected === m.key;
                        return (
                            <button
                                key={m.key}
                                onClick={() => setSelected(m.key)}
                                className={`w-full rounded-xl border bg-white p-3 text-start transition ${
                                    active ? "border-[#C8A24A] ring-1 ring-[#C8A24A]" : "border-black/10 hover:border-[#C8A24A]/50"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium text-[#0B0B0B]">{t(m.label)}</p>
                                    <span
                                        aria-hidden
                                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${tpl.enabled ? "bg-[#C8A24A]" : "bg-gray-300"}`}
                                    />
                                </div>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    {m.audience === "customer" ? t("An Kunden") : t("An Studio")}
                                    {tpl.enabled ? "" : ` · ${t("deaktiviert")}`}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {/* RECHTS: Editor + Vorschau */}
                <div className="space-y-6">
                    <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-4">
                            <div className="min-w-0">
                                <h2 className="text-lg font-medium text-[#0B0B0B]">{t(meta.label)}</h2>
                                <p className="mt-1 text-sm text-gray-500">{t(meta.description)}</p>
                            </div>
                            <label className="flex shrink-0 items-center gap-2 text-sm text-gray-600">
                                <span>{current.enabled ? t("Aktiv") : t("Aus")}</span>
                                <button
                                    type="button"
                                    onClick={toggleEnabled}
                                    aria-label={current.enabled ? t("Vorlage deaktivieren") : t("Vorlage aktivieren")}
                                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${current.enabled ? "bg-[#C8A24A]" : "bg-gray-300"}`}
                                >
                                    <span
                                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${current.enabled ? "left-[22px]" : "left-0.5"}`}
                                    />
                                </button>
                            </label>
                        </div>

                        <label className="mt-4 block">
                            <span className="text-sm text-gray-600">{t("Betreff")}</span>
                            <input
                                value={current.subject}
                                onChange={(e) => setField("subject", e.target.value)}
                                className="mt-1 w-full rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-[#C8A24A]"
                            />
                        </label>

                        <label className="mt-4 block">
                            <span className="text-sm text-gray-600">{t("Text")}</span>
                            <textarea
                                ref={bodyRef}
                                value={current.body}
                                onChange={(e) => setField("body", e.target.value)}
                                rows={14}
                                className="mt-1 w-full rounded-xl border border-black/10 p-3 text-sm leading-relaxed outline-none focus:border-[#C8A24A]"
                            />
                        </label>

                        <div className="mt-3">
                            <p className="mb-2 text-xs text-gray-500">
                                {t("Platzhalter einfügen (klicken) – werden beim Versand automatisch ersetzt:")}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {meta.placeholders.map((token) => (
                                    <button
                                        key={token}
                                        type="button"
                                        onClick={() => insertPlaceholder(token)}
                                        title={PLACEHOLDER_LABELS[token] ? t(PLACEHOLDER_LABELS[token]) : token}
                                        className="rounded-full border border-black/10 bg-[#F7F3EE] px-3 py-1 font-mono text-xs text-[#8a6d24] transition hover:border-[#C8A24A]"
                                    >
                                        {`{{${token}}}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Live-Vorschau */}
                    <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm font-medium text-[#0B0B0B]">{t("Vorschau")}</h3>
                            <span className="text-xs text-gray-400">{t("Beispieldaten")}</span>
                        </div>
                        <div className="mb-3 rounded-xl bg-[#F7F3EE] px-4 py-2 text-sm">
                            <span className="text-gray-500">{t("Betreff:")} </span>
                            <span className="font-medium text-[#0B0B0B]">{preview.subject}</span>
                        </div>
                        <iframe
                            title={t("E-Mail-Vorschau")}
                            sandbox=""
                            srcDoc={preview.html}
                            className="h-[460px] w-full rounded-xl border border-black/10 bg-white"
                        />
                    </section>
                </div>
            </div>

            {/* Speichern */}
            <div className="sticky bottom-4 mt-6 flex items-center gap-3 rounded-2xl border border-black/10 bg-white/90 p-4 backdrop-blur">
                <button
                    onClick={save}
                    disabled={saving}
                    className="rounded-full bg-[#C8A24A] px-8 py-3 font-medium text-black transition hover:scale-[1.02] disabled:opacity-50"
                >
                    {saving ? t("Speichern …") : t("Speichern")}
                </button>
                {status && <span className="text-sm text-green-600">{status}</span>}
                {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
        </div>
    );
}
