// Registry der Sektionen auf der Startseite – Reihenfolge, Labels und
// Verknüpfung zur Bildverwaltung. Client-sicher (keine Server-Imports).

export type SectionMedia =
    | { kind: "group"; groupId: string }
    | { kind: "gallery" }
    | { kind: "none" };

export type HomeSection = {
    id: string;
    label: string;
    description: string;
    media: SectionMedia;
};

export const HOME_SECTIONS: HomeSection[] = [
    { id: "hero", label: "Hero", description: "Großer Kopfbereich ganz oben.", media: { kind: "group", groupId: "hero" } },
    { id: "services", label: "Services", description: "Behandlungen mit eigener Detailseite – Texte, Bilder und neue Services im Editor.", media: { kind: "none" } },
    { id: "whyus", label: "Warum wir", description: "Vier Vorteils-Kacheln.", media: { kind: "none" } },
    { id: "gallery", label: "Galerie", description: "Unsere Arbeiten – Fotos & Videos.", media: { kind: "gallery" } },
    { id: "testimonials", label: "Bewertungen", description: "Kundenstimmen.", media: { kind: "none" } },
    { id: "about", label: "Über uns", description: "Über-uns-Sektion mit Bild.", media: { kind: "group", groupId: "about_home" } },
    { id: "contact", label: "Kontakt / Termin", description: "Buchungskalender.", media: { kind: "none" } },
];

export const DEFAULT_SECTIONS: Record<string, boolean> = Object.fromEntries(
    HOME_SECTIONS.map((s) => [s.id, true]),
);

export function isValidSection(id: string): boolean {
    return id in DEFAULT_SECTIONS;
}

export type SectionVisibility = Record<string, boolean>;
