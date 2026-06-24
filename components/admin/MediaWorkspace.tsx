"use client";

import { useState } from "react";
import Image from "next/image";
import { HOME_SECTIONS, type HomeSection } from "@/lib/sections";
import { MEDIA_GROUPS, MEDIA_SLOTS, type MediaSlot } from "@/lib/media/registry";
import { useMediaUrl } from "@/components/media/MediaProvider";
import { useSectionVisible, useSetSectionVisible } from "@/components/media/SectionsProvider";
import type { GalleryItem } from "@/lib/media/server";
import { DEFAULT_CONTENT, type SiteContent } from "@/lib/content/types";
import ImageSlotManager from "./ImageSlotManager";
import GalleryManager from "./GalleryManager";
import SectionContentEditor from "./SectionContentEditor";
import NavbarStylePicker from "./NavbarStylePicker";
import type { NavbarStyle } from "@/lib/branding/types";

type Entry =
    | { kind: "home"; section: HomeSection }
    | { kind: "page"; id: string; label: string; description: string; groupId: string; href: string };

const ABOUT_PAGE_ENTRY = {
    kind: "page" as const,
    id: "about_page",
    label: "Seite: Über uns",
    description: "Bilder der separaten Über-uns-Seite (/about).",
    groupId: "about_page",
    href: "/about",
};

const BRANDING_ENTRY = {
    kind: "page" as const,
    id: "branding",
    label: "Navbar (Logo & Stil)",
    description: "Schriftzug-Stil und optionales Logo-Bild für die obere Navigation.",
    groupId: "branding",
    href: "/",
};

const PAGE_ENTRIES = [ABOUT_PAGE_ENTRY, BRANDING_ENTRY];

function firstSlotKey(groupId: string): string | null {
    return MEDIA_SLOTS.find((s) => s.group === groupId)?.key ?? null;
}

const CONTENT_KINDS: Record<string, "hero" | "services" | "whyus" | "testimonials" | "about"> = {
    hero: "hero",
    services: "services",
    whyus: "whyus",
    testimonials: "testimonials",
    about: "about",
};

export default function MediaWorkspace({
    gallery,
    initialContent,
    navbarStyle = "serif",
}: {
    gallery: GalleryItem[];
    initialContent?: SiteContent;
    navbarStyle?: NavbarStyle;
}) {
    const [selected, setSelected] = useState<string>("hero");
    const [content, setContent] = useState<SiteContent>(initialContent ?? DEFAULT_CONTENT);

    const current: Entry =
        PAGE_ENTRIES.find((e) => e.id === selected) ?? {
            kind: "home",
            section: HOME_SECTIONS.find((s) => s.id === selected) ?? HOME_SECTIONS[0],
        };

    return (
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
            {/* LINKS: Mini-Homepage */}
            <div className="lg:sticky lg:top-20 self-start">
                <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">Startseite (von oben nach unten)</p>
                <div className="space-y-2">
                    {HOME_SECTIONS.map((section) => (
                        <SectionRow
                            key={section.id}
                            section={section}
                            selected={selected === section.id}
                            onSelect={() => setSelected(section.id)}
                        />
                    ))}
                </div>

                <p className="mb-2 mt-5 text-xs uppercase tracking-wide text-gray-400">Weitere</p>
                <div className="space-y-2">
                    {PAGE_ENTRIES.map((e) => (
                        <button
                            key={e.id}
                            onClick={() => setSelected(e.id)}
                            className={`w-full rounded-xl border bg-white p-3 text-left transition ${
                                selected === e.id
                                    ? "border-[#C8A24A] ring-1 ring-[#C8A24A]"
                                    : "border-black/10 hover:border-[#C8A24A]/50"
                            }`}
                        >
                            <p className="text-sm font-medium text-[#0B0B0B]">{e.label}</p>
                            <p className="text-xs text-gray-500">{e.id === "branding" ? "Logo" : "separate Seite"}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* RECHTS: Detail der gewählten Sektion */}
            <div>
                <Detail
                    entry={current}
                    gallery={gallery}
                    content={content}
                    onContentChange={setContent}
                    navbarStyle={navbarStyle}
                />
            </div>
        </div>
    );
}

function SectionRow({
    section,
    selected,
    onSelect,
}: {
    section: HomeSection;
    selected: boolean;
    onSelect: () => void;
}) {
    const visible = useSectionVisible(section.id);
    const setLocal = useSetSectionVisible();
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(false);
    const thumbKey = section.media.kind === "group" ? firstSlotKey(section.media.groupId) : null;

    async function toggle(e: React.MouseEvent) {
        e.stopPropagation();
        const next = !visible;
        setBusy(true);
        setErr(false);
        setLocal(section.id, next); // sofortige optimistische Reaktion
        try {
            const res = await fetch("/api/admin/sections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: section.id, visible: next }),
            });
            if (!res.ok) throw new Error();
        } catch {
            setLocal(section.id, visible); // bei Fehler zurückrollen
            setErr(true);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div
            onClick={onSelect}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-2.5 transition ${
                selected ? "border-[#C8A24A] ring-1 ring-[#C8A24A]" : "border-black/10 hover:border-[#C8A24A]/50"
            } ${visible ? "" : "opacity-50"}`}
        >
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-[#F7F3EE]">
                {thumbKey ? (
                    <Thumb keyName={thumbKey} />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-300">
                        {section.media.kind === "gallery" ? "▦" : "—"}
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#0B0B0B]">{section.label}</p>
                <p className={`truncate text-xs ${err ? "text-red-600" : "text-gray-500"}`}>
                    {err ? "Fehler – erneut versuchen" : visible ? "Sichtbar" : "Ausgeblendet"}
                </p>
            </div>

            <button
                onClick={toggle}
                disabled={busy}
                aria-label={visible ? "Sektion ausblenden" : "Sektion einblenden"}
                className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${
                    visible ? "bg-[#C8A24A]" : "bg-gray-300"
                }`}
            >
                <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                        visible ? "left-[22px]" : "left-0.5"
                    }`}
                />
            </button>
        </div>
    );
}

function Thumb({ keyName }: { keyName: string }) {
    const url = useMediaUrl(keyName);
    if (!url) return null;
    return <Image src={url} alt="" fill sizes="64px" unoptimized className="object-cover" />;
}

function Detail({
    entry,
    gallery,
    content,
    onContentChange,
    navbarStyle,
}: {
    entry: Entry;
    gallery: GalleryItem[];
    content: SiteContent;
    onContentChange: (c: SiteContent) => void;
    navbarStyle: NavbarStyle;
}) {
    if (entry.kind === "page") {
        return (
            <div>
                <DetailHeader title={entry.label} description={entry.description} href={entry.href} />
                {entry.id === "branding" && <NavbarStylePicker initial={navbarStyle} />}
                <SlotGrid slots={MEDIA_SLOTS.filter((s) => s.group === entry.groupId)} />
            </div>
        );
    }

    const { section } = entry;
    const media = section.media;
    const group = media.kind === "group" ? MEDIA_GROUPS.find((g) => g.id === media.groupId) : null;
    const href = media.kind === "gallery" ? "/#gallery" : group?.href;
    const contentKind = CONTENT_KINDS[section.id];

    return (
        <div>
            <DetailHeader title={section.label} description={section.description} href={href} />
            {contentKind && <SectionContentEditor kind={contentKind} value={content} onChange={onContentChange} />}
            {media.kind === "group" && <SlotGrid slots={MEDIA_SLOTS.filter((s) => s.group === media.groupId)} />}
            {media.kind === "gallery" && <GalleryManager initial={gallery} />}
            {media.kind === "none" && !contentKind && (
                <p className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-gray-500">
                    Diese Sektion hat keine bearbeitbaren Bilder. Über den Schalter links kannst du sie ein- oder
                    ausblenden.
                </p>
            )}
        </div>
    );
}

function DetailHeader({
    title,
    description,
    href,
}: {
    title: string;
    description: string;
    href?: string;
}) {
    return (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-black/10 pb-3">
            <div>
                <h2 className="text-xl font-medium text-[#0B0B0B]">{title}</h2>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
            {href && (
                <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="whitespace-nowrap text-sm text-[#C8A24A] hover:underline"
                >
                    Auf der Seite ansehen ↗
                </a>
            )}
        </div>
    );
}

function SlotGrid({ slots }: { slots: MediaSlot[] }) {
    if (slots.length === 0) {
        return <p className="text-sm text-gray-500">Keine Bilder in dieser Sektion.</p>;
    }
    return (
        <div className="grid sm:grid-cols-2 gap-4">
            {slots.map((slot) => (
                <ImageSlotManager key={slot.key} slot={slot} />
            ))}
        </div>
    );
}
