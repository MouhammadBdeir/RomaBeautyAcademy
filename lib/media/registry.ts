// Zentrale Registry aller editierbaren Bilder der Website.
// Gruppen = Sektionen der Seite; jeder Slot weiß, wo er erscheint und welche
// Auflösung empfohlen ist.

export type MediaGroup = {
    id: string;
    title: string;
    description: string;
    href: string; // Link, um die Stelle live anzusehen
};

export type MediaSlot = {
    key: string;
    group: string; // -> MediaGroup.id
    label: string;
    where: string; // wo genau das Bild erscheint
    recommended: string; // empfohlene Auflösung, z. B. "2560 × 1440 px"
    aspect: string; // CSS-Seitenverhältnis, z. B. "16/9"
    defaultUrl: string;
};

export const MEDIA_GROUPS: MediaGroup[] = [
    {
        id: "hero",
        title: "Startseite · Hero",
        description: "Der große Bereich ganz oben auf der Startseite – Hintergrund plus drei Bilder.",
        href: "/#home",
    },
    {
        id: "services",
        title: "Startseite · Services",
        description: "Die sechs Behandlungs-Karten im Services-Bereich.",
        href: "/#services",
    },
    {
        id: "about_home",
        title: "Startseite · Über uns",
        description: "Das Bild neben dem Text in der Über-uns-Sektion der Startseite.",
        href: "/#about",
    },
    {
        id: "about_page",
        title: "Seite: Über uns (/about)",
        description: "Die Bilder auf der separaten Über-uns-Seite.",
        href: "/about",
    },
    {
        id: "branding",
        title: "Branding",
        description: "Logo der Website – erscheint oben in der Navigation.",
        href: "/",
    },
];

export const MEDIA_SLOTS: MediaSlot[] = [
    // Hero
    { key: "hero_bg", group: "hero", label: "Hintergrundbild", where: "Vollflächig hinter der Überschrift.", recommended: "2560 × 1440 px", aspect: "16/9", defaultUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9" },
    { key: "hero_main", group: "hero", label: "Großes Bild", where: "Breites Bild unter den Buttons.", recommended: "1200 × 600 px", aspect: "2/1", defaultUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702" },
    { key: "hero_small1", group: "hero", label: "Kleines Bild (oben)", where: "Oberes der beiden kleinen Bilder rechts.", recommended: "640 × 320 px", aspect: "2/1", defaultUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f" },
    { key: "hero_small2", group: "hero", label: "Kleines Bild (unten)", where: "Unteres der beiden kleinen Bilder rechts.", recommended: "640 × 320 px", aspect: "2/1", defaultUrl: "https://images.unsplash.com/photo-1526045478516-99145907023c" },

    // Services
    { key: "service_gesicht", group: "services", label: "Gesichtsbehandlung", where: "Karte 1.", recommended: "800 × 600 px", aspect: "4/3", defaultUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881" },
    { key: "service_wimpern", group: "services", label: "Wimpernverlängerung", where: "Karte 2.", recommended: "800 × 600 px", aspect: "4/3", defaultUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702" },
    { key: "service_haut", group: "services", label: "Hautpflege", where: "Karte 3.", recommended: "800 × 600 px", aspect: "4/3", defaultUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9" },
    { key: "service_microblading", group: "services", label: "Microblading", where: "Karte 4.", recommended: "800 × 600 px", aspect: "4/3", defaultUrl: "https://images.unsplash.com/photo-1596704017254-9b121068fb31" },
    { key: "service_makeup", group: "services", label: "Make-Up", where: "Karte 5.", recommended: "800 × 600 px", aspect: "4/3", defaultUrl: "https://images.unsplash.com/photo-1487412912498-0447578fcca8" },
    { key: "service_antiaging", group: "services", label: "Anti-Aging", where: "Karte 6.", recommended: "800 × 600 px", aspect: "4/3", defaultUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be" },

    // Über uns (Startseite)
    { key: "about_home", group: "about_home", label: "Über-uns-Bild", where: "Bild rechts neben dem Text.", recommended: "1000 × 800 px", aspect: "5/4", defaultUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9" },

    // About-Seite
    { key: "about_main", group: "about_page", label: "Großes Bild", where: "Oberes großes Bild der About-Seite.", recommended: "1200 × 600 px", aspect: "2/1", defaultUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702" },
    { key: "about_2", group: "about_page", label: "Kleines Bild (links)", where: "Linkes der beiden kleinen Bilder.", recommended: "600 × 400 px", aspect: "3/2", defaultUrl: "https://images.unsplash.com/photo-1526045478516-99145907023c" },
    { key: "about_3", group: "about_page", label: "Kleines Bild (rechts)", where: "Rechtes der beiden kleinen Bilder.", recommended: "600 × 400 px", aspect: "3/2", defaultUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f" },

    // Branding
    { key: "logo", group: "branding", label: "Logo", where: "Oben links in der Navigation – ersetzt den Schriftzug.", recommended: "240 × 80 px · transparentes PNG", aspect: "3/1", defaultUrl: "" },
];

export const DEFAULT_IMAGE_BY_KEY: Record<string, string> = Object.fromEntries(
    MEDIA_SLOTS.map((s) => [s.key, s.defaultUrl]),
);

export function isValidSlot(key: string): boolean {
    return key in DEFAULT_IMAGE_BY_KEY;
}

// Bild-Overrides: key -> URL (leer/fehlend = Standardbild aus der Registry).
export type SiteImages = Record<string, string>;
