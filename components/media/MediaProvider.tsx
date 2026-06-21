"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_IMAGE_BY_KEY, type SiteImages } from "@/lib/media/registry";
import { DEFAULT_CONTENT, mergeContent, type SiteContent } from "@/lib/content/types";

type MediaState = { images: SiteImages; content: SiteContent };

const MediaContext = createContext<MediaState>({ images: {}, content: DEFAULT_CONTENT });

// Pollt /api/site-state -> Bilder UND Texte live, ganz ohne Firestore-Rules.
export function MediaProvider({
    initial = {},
    initialContent,
    children,
}: {
    initial?: SiteImages;
    initialContent?: SiteContent;
    children: React.ReactNode;
}) {
    const [state, setState] = useState<MediaState>({
        images: initial,
        content: initialContent ?? DEFAULT_CONTENT,
    });

    useEffect(() => {
        let active = true;
        let timer: ReturnType<typeof setTimeout>;

        const tick = async () => {
            try {
                const res = await fetch("/api/site-state", { cache: "no-store" });
                if (active && res.ok) {
                    const d = await res.json();
                    setState({
                        images: (d?.images ?? {}) as SiteImages,
                        content: mergeContent(d?.content),
                    });
                }
            } catch {
                /* ignorieren – letzter Stand bleibt sichtbar */
            }
            if (active) {
                const hidden = typeof document !== "undefined" && document.visibilityState === "hidden";
                timer = setTimeout(tick, hidden ? 20000 : 4000);
            }
        };

        tick();
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, []);

    return <MediaContext.Provider value={state}>{children}</MediaContext.Provider>;
}

/** Liefert die aktuelle URL eines Slots (Override oder Standardbild). */
export function useMediaUrl(key: string): string {
    const { images } = useContext(MediaContext);
    return images[key] || DEFAULT_IMAGE_BY_KEY[key] || "";
}

/** Liefert die aktuellen Textinhalte (mit Defaults gemischt). */
export function useContent(): SiteContent {
    return useContext(MediaContext).content;
}
