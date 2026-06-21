// Editierbare Textinhalte der Startseite. Client-sicher.

export type WhyCard = { id: string; title: string; text: string };
export type Review = { id: string; name: string; text: string; rating: number };
export type Stat = { id: string; value: number; suffix: string; label: string };
export type Service = { id: string; slug: string; title: string; short: string; long: string; imageUrl: string };

export function slugify(input: string): string {
    return (
        input
            .toLowerCase()
            .trim()
            .replace(/ä/g, "ae")
            .replace(/ö/g, "oe")
            .replace(/ü/g, "ue")
            .replace(/ß/g, "ss")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "service"
    );
}

export type SiteContent = {
    hero: { eyebrow: string; heading: string; subtitle: string; primary: string; secondary: string };
    services: { heading: string; subtitle: string; items: Service[] };
    whyus: { eyebrow: string; heading: string; cards: WhyCard[] };
    testimonials: { eyebrow: string; heading: string; reviews: Review[] };
    about: { eyebrow: string; heading: string; paragraphs: string[]; stats: Stat[] };
};

export const DEFAULT_CONTENT: SiteContent = {
    hero: {
        eyebrow: "Luxury Beauty Studio",
        heading: "Deine Schönheit, in besten Händen",
        subtitle:
            "Premium-Kosmetik mit Fokus auf natürliche Eleganz – individuell auf dich abgestimmt für ein Ergebnis, das begeistert.",
        primary: "Termin buchen",
        secondary: "Mehr erfahren",
    },
    services: {
        heading: "Unsere Services",
        subtitle: "Premium Beauty Treatments für dein Wohlbefinden",
        items: [
            {
                id: "gesicht",
                slug: "gesichtsbehandlung",
                title: "Gesichtsbehandlung",
                short: "Tiefenreinigung & Glow für strahlende Haut.",
                long: "Unsere Gesichtsbehandlung ist eine wohltuende Auszeit für deine Haut. Wir beginnen mit einer gründlichen Analyse deines Hauttyps und reinigen die Haut anschließend porentief – sanft, aber wirkungsvoll.\n\nDanach verwöhnen wir dich mit einem individuell abgestimmten Peeling, einer pflegenden Maske und hochwertigen Wirkstoff-Seren. Das regt die Durchblutung an, spendet intensiv Feuchtigkeit und verfeinert das Hautbild sichtbar.\n\nDas Ergebnis ist ein frischer, ebenmäßiger und strahlender Teint. Ideal für alle, die ihrer Haut regelmäßig etwas Gutes tun und langfristig in ihr Wohlbefinden investieren möchten.",
                imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881",
            },
            {
                id: "wimpern",
                slug: "wimpernverlaengerung",
                title: "Wimpernverlängerung",
                short: "Perfekte Länge & natürlicher Look.",
                long: "Wache, ausdrucksstarke Augen ganz ohne Mascara: Bei der Wimpernverlängerung bringen wir einzeln aufgebrachte Kunsthärchen präzise auf deine Naturwimpern auf.\n\nGemeinsam wählen wir Länge, Schwung und Volumen so, dass das Ergebnis perfekt zu deiner Augenform und deinem Typ passt – von dezent-natürlich bis ausdrucksstark.\n\nDie Behandlung ist entspannend und völlig schmerzfrei. Du sparst dir das tägliche Schminken und genießt über Wochen hinweg einen makellosen, gepflegten Augenaufschlag.",
                imageUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702",
            },
            {
                id: "haut",
                slug: "hautpflege",
                title: "Hautpflege",
                short: "Individuelle Pflege für gesunde Haut.",
                long: "Jede Haut ist anders – deshalb gibt es bei uns keine Behandlung von der Stange. In einem ausführlichen Gespräch und einer professionellen Hautanalyse ermitteln wir, was deine Haut wirklich braucht.\n\nAuf dieser Basis stellen wir eine individuelle Pflegeroutine zusammen und setzen gezielt hochwertige, hautfreundliche Wirkstoffe ein – ob gegen Trockenheit, Unreinheiten oder erste Fältchen.\n\nSo erhältst du nicht nur eine einmalige Behandlung, sondern einen klaren Plan für dauerhaft gesunde, gepflegte Haut.",
                imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9",
            },
            {
                id: "microblading",
                slug: "microblading",
                title: "Microblading",
                short: "Perfekte Augenbrauen-Form für dein Gesicht.",
                long: "Volle, perfekt geformte Augenbrauen rahmen das Gesicht und verleihen ihm Ausdruck. Mit der Microblading-Technik zeichnen wir feine, härchenartige Striche – für ein täuschend echtes, natürliches Ergebnis.\n\nVorab bestimmen wir gemeinsam die ideale Form und Farbe passend zu deinen Gesichtszügen. Die Pigmentierung hält viele Monate und spart dir das tägliche Nachzeichnen.\n\nPerfekt für alle, die sich lückenlose, definierte Augenbrauen wünschen und morgens wertvolle Zeit sparen möchten.",
                imageUrl: "https://images.unsplash.com/photo-1596704017254-9b121068fb31",
            },
            {
                id: "makeup",
                slug: "make-up",
                title: "Make-Up",
                short: "Professionelles Make-Up für jeden Anlass.",
                long: "Ob strahlende Braut, glamouröser Abend oder natürlicher Tages-Look – wir setzen dich gekonnt in Szene. Unser professionelles Make-Up betont deine Vorzüge und wirkt dabei stets natürlich.\n\nWir arbeiten ausschließlich mit hochwertigen, langanhaltenden Produkten, die auch auf Fotos und über viele Stunden hinweg perfekt sitzen.\n\nAuf Wunsch beraten wir dich zu Farben und Techniken, damit du deinen Look auch zu Hause ganz einfach nachstylen kannst.",
                imageUrl: "https://images.unsplash.com/photo-1487412912498-0447578fcca8",
            },
            {
                id: "antiaging",
                slug: "anti-aging",
                title: "Anti-Aging",
                short: "Moderne Treatments für jugendliche Haut.",
                long: "Mit gezielten Anti-Aging-Treatments schenken wir deiner Haut neue Spannkraft und Frische. Moderne Wirkstoffe und Techniken straffen, glätten und versorgen die Haut intensiv mit Feuchtigkeit.\n\nWir gehen individuell auf erste Linien, nachlassende Elastizität und müde Haut ein und stimmen die Behandlung genau auf dich ab.\n\nDas Ergebnis ist ein sichtbar frischerer, ebenmäßigerer und jugendlicher Teint – ganz natürlich und ohne Eingriff.",
                imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
            },
        ],
    },
    whyus: {
        eyebrow: "Warum wir",
        heading: "Warum RomaBeautyAcademy?",
        cards: [
            { id: "c1", title: "Höchste Hygiene", text: "Saubere Arbeitsweise und professionelle Standards für maximale Sicherheit." },
            { id: "c2", title: "Premium Produkte", text: "Wir verwenden ausschließlich hochwertige und hautfreundliche Produkte." },
            { id: "c3", title: "Individuelle Beratung", text: "Jede Behandlung wird auf deine Wünsche und Bedürfnisse abgestimmt." },
            { id: "c4", title: "Professionelle Expertise", text: "Erfahrung, Leidenschaft und moderne Techniken für beste Ergebnisse." },
        ],
    },
    testimonials: {
        eyebrow: "Bewertungen",
        heading: "Das sagen unsere Kunden",
        reviews: [
            { id: "r1", name: "Sarah M.", text: "Absolut professionelle Behandlung. Das Ergebnis hat meine Erwartungen übertroffen.", rating: 5 },
            { id: "r2", name: "Jessica K.", text: "Wunderschöne Atmosphäre und sehr freundliche Beratung. Ich komme definitiv wieder.", rating: 5 },
            { id: "r3", name: "Anna L.", text: "Die beste Beauty-Behandlung, die ich bisher hatte. Sehr empfehlenswert.", rating: 5 },
        ],
    },
    about: {
        eyebrow: "Über uns",
        heading: "Schönheit, die zu dir passt",
        paragraphs: [
            "Bei RomaBeautyAcademy verbinden wir moderne Kosmetik mit echtem Gespür für natürliche Schönheit.",
            "Wir kombinieren erprobte Techniken mit hochwertiger Pflege – für Ergebnisse, die natürlich wirken und lange begeistern.",
            "Jede Behandlung stimmen wir individuell auf dich ab, damit du dich rundum wohlfühlst.",
        ],
        stats: [
            { id: "s1", value: 5, suffix: "+", label: "Jahre Erfahrung" },
            { id: "s2", value: 1000, suffix: "+", label: "Zufriedene Kunden" },
        ],
    },
};

function str(v: unknown, fallback = ""): string {
    return typeof v === "string" ? v : fallback;
}

// Eingehende (evtl. unvollständige) Daten mit den Defaults zusammenführen.
export function mergeContent(raw: unknown): SiteContent {
    const x = (raw ?? {}) as Record<string, unknown>;
    const d = DEFAULT_CONTENT;

    const hero = (x.hero ?? {}) as Record<string, unknown>;
    const services = (x.services ?? {}) as Record<string, unknown>;
    const whyus = (x.whyus ?? {}) as Record<string, unknown>;
    const testi = (x.testimonials ?? {}) as Record<string, unknown>;
    const about = (x.about ?? {}) as Record<string, unknown>;

    // Services sind dynamisch: hinzufügen/entfernen möglich. Komplett aus den Daten.
    const rawServiceItems = Array.isArray(services.items)
        ? (services.items as Record<string, unknown>[])
        : null;
    const serviceItems: Service[] = rawServiceItems
        ? rawServiceItems.map((r, i) => {
              const title = str(r?.title) || `Service ${i + 1}`;
              return {
                  id: str(r?.id) || `svc-${i}`,
                  slug: str(r?.slug) || slugify(title),
                  title,
                  short: str(r?.short),
                  long: str(r?.long),
                  imageUrl: str(r?.imageUrl),
              };
          })
        : d.services.items;

    const cards = Array.isArray(whyus.cards)
        ? (whyus.cards as unknown[]).map((c, i) => {
              const o = (c ?? {}) as Record<string, unknown>;
              return { id: str(o.id, `c${i}`), title: str(o.title), text: str(o.text) };
          })
        : d.whyus.cards;

    const reviews = Array.isArray(testi.reviews)
        ? (testi.reviews as unknown[]).map((r, i) => {
              const o = (r ?? {}) as Record<string, unknown>;
              const rating = typeof o.rating === "number" ? Math.min(5, Math.max(1, Math.round(o.rating))) : 5;
              return { id: str(o.id, `r${i}`), name: str(o.name), text: str(o.text), rating };
          })
        : d.testimonials.reviews;

    const paragraphs = Array.isArray(about.paragraphs)
        ? (about.paragraphs as unknown[]).map((p) => str(p)).filter(Boolean)
        : d.about.paragraphs;

    const stats = Array.isArray(about.stats)
        ? (about.stats as unknown[]).map((s, i) => {
              const o = (s ?? {}) as Record<string, unknown>;
              return {
                  id: str(o.id, `s${i}`),
                  value: typeof o.value === "number" ? o.value : 0,
                  suffix: str(o.suffix),
                  label: str(o.label),
              };
          })
        : d.about.stats;

    return {
        hero: {
            eyebrow: str(hero.eyebrow, d.hero.eyebrow),
            heading: str(hero.heading, d.hero.heading),
            subtitle: str(hero.subtitle, d.hero.subtitle),
            primary: str(hero.primary, d.hero.primary),
            secondary: str(hero.secondary, d.hero.secondary),
        },
        services: {
            heading: str(services.heading, d.services.heading),
            subtitle: str(services.subtitle, d.services.subtitle),
            items: serviceItems,
        },
        whyus: {
            eyebrow: str(whyus.eyebrow, d.whyus.eyebrow),
            heading: str(whyus.heading, d.whyus.heading),
            cards,
        },
        testimonials: {
            eyebrow: str(testi.eyebrow, d.testimonials.eyebrow),
            heading: str(testi.heading, d.testimonials.heading),
            reviews,
        },
        about: {
            eyebrow: str(about.eyebrow, d.about.eyebrow),
            heading: str(about.heading, d.about.heading),
            paragraphs: paragraphs.length ? paragraphs : d.about.paragraphs,
            stats,
        },
    };
}
