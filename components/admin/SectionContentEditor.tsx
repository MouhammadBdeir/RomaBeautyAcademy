"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { slugify, type SiteContent } from "@/lib/content/types";
import { compressImage } from "@/lib/media/resize";
import { uploadFile } from "@/lib/media/upload";

type ContentKind = "hero" | "services" | "whyus" | "testimonials" | "about";

function uid(): string {
    return Math.random().toString(36).slice(2, 9);
}

function Field({
    label,
    value,
    onChange,
    area = false,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    area?: boolean;
    placeholder?: string;
}) {
    const cls = "mt-1 w-full rounded-lg border border-black/10 p-2 text-sm outline-none focus:border-[#C8A24A]";
    return (
        <label className="block">
            <span className="text-xs text-gray-500">{label}</span>
            {area ? (
                <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} placeholder={placeholder} className={cls} />
            ) : (
                <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
            )}
        </label>
    );
}

const addBtn = "rounded-full bg-[#C8A24A] px-3 py-1 text-xs text-black transition hover:scale-[1.03]";
const delBtn = "self-end rounded-full border border-black/10 px-3 py-2 text-xs transition hover:border-red-400 hover:text-red-600";

function HeroFields({ value, onChange }: { value: SiteContent; onChange: (c: SiteContent) => void }) {
    const h = value.hero;
    const set = (patch: Partial<typeof h>) => onChange({ ...value, hero: { ...h, ...patch } });
    return (
        <div className="space-y-3">
            <Field label="Eyebrow (klein, oben)" value={h.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <Field label="Überschrift" value={h.heading} onChange={(v) => set({ heading: v })} />
            <Field label="Untertitel" value={h.subtitle} onChange={(v) => set({ subtitle: v })} area />
            <div className="grid grid-cols-2 gap-3">
                <Field label="Button 1" value={h.primary} onChange={(v) => set({ primary: v })} />
                <Field label="Button 2" value={h.secondary} onChange={(v) => set({ secondary: v })} />
            </div>
        </div>
    );
}

function WhyUsFields({ value, onChange }: { value: SiteContent; onChange: (c: SiteContent) => void }) {
    const w = value.whyus;
    const set = (patch: Partial<typeof w>) => onChange({ ...value, whyus: { ...w, ...patch } });
    return (
        <div className="space-y-3">
            <Field label="Eyebrow" value={w.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <Field label="Überschrift" value={w.heading} onChange={(v) => set({ heading: v })} />
            <div className="flex items-center justify-between pt-1">
                <span className="text-xs uppercase tracking-wide text-gray-400">Karten</span>
                <button onClick={() => set({ cards: [...w.cards, { id: uid(), title: "", text: "" }] })} className={addBtn}>+ Karte</button>
            </div>
            {w.cards.map((c) => (
                <div key={c.id} className="space-y-2 rounded-lg border border-black/10 p-3">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Field label="Titel" value={c.title} onChange={(v) => set({ cards: w.cards.map((x) => (x.id === c.id ? { ...x, title: v } : x)) })} />
                        </div>
                        <button onClick={() => set({ cards: w.cards.filter((x) => x.id !== c.id) })} className={delBtn}>×</button>
                    </div>
                    <Field label="Text" value={c.text} onChange={(v) => set({ cards: w.cards.map((x) => (x.id === c.id ? { ...x, text: v } : x)) })} area />
                </div>
            ))}
        </div>
    );
}

function TestiFields({ value, onChange }: { value: SiteContent; onChange: (c: SiteContent) => void }) {
    const t = value.testimonials;
    const set = (patch: Partial<typeof t>) => onChange({ ...value, testimonials: { ...t, ...patch } });
    return (
        <div className="space-y-3">
            <Field label="Eyebrow" value={t.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <Field label="Überschrift" value={t.heading} onChange={(v) => set({ heading: v })} />
            <div className="flex items-center justify-between pt-1">
                <span className="text-xs uppercase tracking-wide text-gray-400">Bewertungen</span>
                <button onClick={() => set({ reviews: [...t.reviews, { id: uid(), name: "", text: "", rating: 5 }] })} className={addBtn}>+ Bewertung</button>
            </div>
            {t.reviews.map((r) => (
                <div key={r.id} className="space-y-2 rounded-lg border border-black/10 p-3">
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <Field label="Name" value={r.name} onChange={(v) => set({ reviews: t.reviews.map((x) => (x.id === r.id ? { ...x, name: v } : x)) })} />
                        </div>
                        <label className="block">
                            <span className="text-xs text-gray-500">Sterne</span>
                            <select
                                value={r.rating}
                                onChange={(e) => set({ reviews: t.reviews.map((x) => (x.id === r.id ? { ...x, rating: Number(e.target.value) } : x)) })}
                                className="mt-1 rounded-lg border border-black/10 p-2 text-sm"
                            >
                                {[5, 4, 3, 2, 1].map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </label>
                        <button onClick={() => set({ reviews: t.reviews.filter((x) => x.id !== r.id) })} className={delBtn}>×</button>
                    </div>
                    <Field label="Text" value={r.text} onChange={(v) => set({ reviews: t.reviews.map((x) => (x.id === r.id ? { ...x, text: v } : x)) })} area />
                </div>
            ))}
        </div>
    );
}

function AboutFields({ value, onChange }: { value: SiteContent; onChange: (c: SiteContent) => void }) {
    const a = value.about;
    const set = (patch: Partial<typeof a>) => onChange({ ...value, about: { ...a, ...patch } });
    return (
        <div className="space-y-3">
            <Field label="Eyebrow" value={a.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <Field label="Überschrift" value={a.heading} onChange={(v) => set({ heading: v })} />

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs uppercase tracking-wide text-gray-400">Absätze</span>
                <button onClick={() => set({ paragraphs: [...a.paragraphs, ""] })} className={addBtn}>+ Absatz</button>
            </div>
            {a.paragraphs.map((p, i) => (
                <div key={i} className="flex gap-2">
                    <textarea
                        value={p}
                        rows={2}
                        onChange={(e) => set({ paragraphs: a.paragraphs.map((x, idx) => (idx === i ? e.target.value : x)) })}
                        className="flex-1 rounded-lg border border-black/10 p-2 text-sm outline-none focus:border-[#C8A24A]"
                    />
                    <button onClick={() => set({ paragraphs: a.paragraphs.filter((_, idx) => idx !== i) })} className="self-start rounded-full border border-black/10 px-3 py-2 text-xs transition hover:border-red-400 hover:text-red-600">×</button>
                </div>
            ))}

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs uppercase tracking-wide text-gray-400">Zahlen (zählen von 0 hoch)</span>
                <button onClick={() => set({ stats: [...a.stats, { id: uid(), value: 0, suffix: "+", label: "" }] })} className={addBtn}>+ Zahl</button>
            </div>
            {a.stats.map((s) => (
                <div key={s.id} className="flex items-end gap-2">
                    <label className="block w-20">
                        <span className="text-xs text-gray-500">Wert</span>
                        <input type="number" value={s.value} onChange={(e) => set({ stats: a.stats.map((x) => (x.id === s.id ? { ...x, value: Number(e.target.value) || 0 } : x)) })} className="mt-1 w-full rounded-lg border border-black/10 p-2 text-sm" />
                    </label>
                    <label className="block w-16">
                        <span className="text-xs text-gray-500">Zusatz</span>
                        <input value={s.suffix} onChange={(e) => set({ stats: a.stats.map((x) => (x.id === s.id ? { ...x, suffix: e.target.value } : x)) })} className="mt-1 w-full rounded-lg border border-black/10 p-2 text-sm" />
                    </label>
                    <div className="flex-1">
                        <Field label="Label" value={s.label} onChange={(v) => set({ stats: a.stats.map((x) => (x.id === s.id ? { ...x, label: v } : x)) })} />
                    </div>
                    <button onClick={() => set({ stats: a.stats.filter((x) => x.id !== s.id) })} className={delBtn}>×</button>
                </div>
            ))}
        </div>
    );
}

function ServiceImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handle(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setError(null);
        try {
            const { file: compressed } = await compressImage(file, { maxDimension: 1600 });
            setProgress(0);
            const { promise } = uploadFile(compressed, "website-images", setProgress);
            const { url } = await promise;
            onChange(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload fehlgeschlagen.");
        } finally {
            setProgress(null);
        }
    }

    return (
        <div>
            <div className="relative h-32 w-full overflow-hidden rounded-lg bg-[#F7F3EE]">
                {value && <Image src={value} alt="" fill sizes="320px" unoptimized className="object-cover" />}
                {progress !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white">{progress}%</div>
                )}
            </div>
            <button type="button" onClick={() => inputRef.current?.click()} className={`mt-2 ${addBtn}`}>
                {value ? "Bild ändern" : "Bild hochladen"}
            </button>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            <input ref={inputRef} type="file" accept="image/*" onChange={handle} className="hidden" />
        </div>
    );
}

function ServicesFields({ value, onChange }: { value: SiteContent; onChange: (c: SiteContent) => void }) {
    const s = value.services;
    const set = (patch: Partial<typeof s>) => onChange({ ...value, services: { ...s, ...patch } });
    const setItem = (id: string, patch: Partial<SiteContent["services"]["items"][number]>) =>
        set({ items: s.items.map((x) => (x.id === id ? { ...x, ...patch } : x)) });

    return (
        <div className="space-y-3">
            <Field label="Überschrift" value={s.heading} onChange={(v) => set({ heading: v })} />
            <Field label="Untertitel" value={s.subtitle} onChange={(v) => set({ subtitle: v })} />

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs uppercase tracking-wide text-gray-400">Services</span>
                <button
                    onClick={() => set({ items: [...s.items, { id: uid(), title: "Neuer Service", slug: "neuer-service", short: "", long: "", imageUrl: "" }] })}
                    className={addBtn}
                >
                    + Service
                </button>
            </div>

            {s.items.map((item) => (
                <div key={item.id} className="space-y-2 rounded-lg border border-black/10 p-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">/services/{item.slug || "…"}</p>
                        <button
                            onClick={() => set({ items: s.items.filter((x) => x.id !== item.id) })}
                            className="rounded-full border border-black/10 px-3 py-1 text-xs transition hover:border-red-400 hover:text-red-600"
                        >
                            Entfernen
                        </button>
                    </div>
                    <ServiceImageUpload value={item.imageUrl} onChange={(url) => setItem(item.id, { imageUrl: url })} />
                    <Field label="Titel" value={item.title} onChange={(v) => setItem(item.id, { title: v, slug: slugify(v) })} />
                    <Field label="Kurztext (Karte)" value={item.short} onChange={(v) => setItem(item.id, { short: v })} />
                    <Field label="Detail-Text (Service-Seite)" value={item.long} onChange={(v) => setItem(item.id, { long: v })} area />
                </div>
            ))}
        </div>
    );
}

export default function SectionContentEditor({
    kind,
    value,
    onChange,
}: {
    kind: ContentKind;
    value: SiteContent;
    onChange: (next: SiteContent) => void;
}) {
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function save() {
        setSaving(true);
        setStatus(null);
        setError(null);
        try {
            const res = await fetch("/api/admin/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(value),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Speichern fehlgeschlagen.");
            setStatus("Gespeichert ✓");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mb-6 rounded-2xl border border-black/10 bg-white p-5">
            <h3 className="mb-3 text-sm font-medium text-[#0B0B0B]">Texte</h3>

            {kind === "hero" && <HeroFields value={value} onChange={onChange} />}
            {kind === "services" && <ServicesFields value={value} onChange={onChange} />}
            {kind === "whyus" && <WhyUsFields value={value} onChange={onChange} />}
            {kind === "testimonials" && <TestiFields value={value} onChange={onChange} />}
            {kind === "about" && <AboutFields value={value} onChange={onChange} />}

            <div className="mt-4 flex items-center gap-3">
                <button onClick={save} disabled={saving} className="rounded-full bg-[#C8A24A] px-6 py-2 text-sm font-medium text-black transition hover:scale-[1.02] disabled:opacity-50">
                    {saving ? "Speichern …" : "Texte speichern"}
                </button>
                {status && <span className="text-xs text-green-600">{status}</span>}
                {error && <span className="text-xs text-red-600">{error}</span>}
            </div>
        </div>
    );
}
