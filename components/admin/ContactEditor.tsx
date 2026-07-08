"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContactData, SocialLink } from "@/lib/contact/types";
import { useT } from "./AdminI18nProvider";

function uid(): string {
    return Math.random().toString(36).slice(2, 10);
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <label className="block">
            <span className="text-sm text-gray-600">{label}</span>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 p-3 outline-none focus:border-[#C8A24A]"
            />
        </label>
    );
}

export default function ContactEditor({ initial }: { initial: ContactData }) {
    const { t } = useT();
    const router = useRouter();
    const [data, setData] = useState<ContactData>(initial);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    function set<K extends keyof ContactData>(key: K, value: ContactData[K]) {
        setData((d) => ({ ...d, [key]: value }));
        setStatus(null);
    }
    function setSocial(id: string, patch: Partial<SocialLink>) {
        setData((d) => ({ ...d, social: d.social.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
    }
    function addSocial() {
        setData((d) => ({ ...d, social: [...d.social, { id: uid(), label: "", url: "" }] }));
    }
    function removeSocial(id: string) {
        setData((d) => ({ ...d, social: d.social.filter((s) => s.id !== id) }));
    }

    async function save() {
        setSaving(true);
        setError(null);
        setStatus(null);
        try {
            const res = await fetch("/api/admin/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
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
        <div className="space-y-6">
            {/* KONTAKT */}
            <section className="rounded-2xl border border-black/10 bg-white p-6">
                <h2 className="mb-4 text-lg font-medium text-[#0B0B0B]">{t("Kontakt")}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t("E-Mail")} type="email" value={data.email} onChange={(v) => set("email", v)} placeholder="info@romabeauty.de" />
                    <Field label={t("Telefon")} value={data.phone} onChange={(v) => set("phone", v)} placeholder="+49 123 456789" />
                    <Field label={t("Straße & Nr.")} value={data.street} onChange={(v) => set("street", v)} placeholder="Musterstraße 15" />
                    <div className="grid grid-cols-3 gap-3">
                        <Field label={t("PLZ")} value={data.zip} onChange={(v) => set("zip", v)} placeholder="59555" />
                        <div className="col-span-2">
                            <Field label={t("Ort")} value={data.city} onChange={(v) => set("city", v)} placeholder="Lippstadt" />
                        </div>
                    </div>
                    <Field label={t("Land")} value={data.country} onChange={(v) => set("country", v)} placeholder="Deutschland" />
                </div>
            </section>

            {/* RECHTLICHES */}
            <section className="rounded-2xl border border-black/10 bg-white p-6">
                <h2 className="mb-1 text-lg font-medium text-[#0B0B0B]">{t("Rechtliches (Impressum)")}</h2>
                <p className="mb-4 text-sm text-gray-500">{t("Erscheint auf der Impressum-Seite.")}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t("Geschäftsführer")} value={data.managingDirector} onChange={(v) => set("managingDirector", v)} placeholder="Max Mustermann" />
                    <Field label={t("Registergericht")} value={data.registerCourt} onChange={(v) => set("registerCourt", v)} placeholder="Amtsgericht Paderborn" />
                    <Field label={t("Handelsregisternummer")} value={data.hrb} onChange={(v) => set("hrb", v)} placeholder="HRB 12345" />
                    <Field label={t("USt-IdNr.")} value={data.vatId} onChange={(v) => set("vatId", v)} placeholder="DE123456789" />
                </div>
            </section>

            {/* SOCIAL */}
            <section className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-medium text-[#0B0B0B]">{t("Social Media")}</h2>
                    <button onClick={addSocial} className="rounded-full bg-[#C8A24A] px-4 py-1.5 text-sm text-black transition hover:scale-[1.03]">
                        {t("+ Hinzufügen")}
                    </button>
                </div>

                {data.social.length === 0 ? (
                    <p className="text-sm text-gray-500">{t("Noch keine Links. Beliebig viele möglich (Instagram, TikTok, Facebook, WhatsApp …).")}</p>
                ) : (
                    <div className="space-y-3">
                        {data.social.map((s) => (
                            <div key={s.id} className="flex flex-wrap items-end gap-3">
                                <div className="w-full sm:w-40">
                                    <Field label={t("Name")} value={s.label} onChange={(v) => setSocial(s.id, { label: v })} placeholder="Instagram" />
                                </div>
                                <div className="w-full min-w-0 sm:flex-1">
                                    <Field label={t("Link")} value={s.url} onChange={(v) => setSocial(s.id, { url: v })} placeholder="https://instagram.com/…" />
                                </div>
                                <button
                                    onClick={() => removeSocial(s.id)}
                                    className="mb-1 rounded-full border border-black/10 px-3 py-2 text-sm transition hover:border-red-400 hover:text-red-600"
                                >
                                    {t("Entfernen")}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* SAVE */}
            <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl border border-black/10 bg-white/90 p-4 backdrop-blur">
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
