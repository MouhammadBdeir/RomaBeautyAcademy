"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { DEFAULT_IMAGE_BY_KEY, type SiteImages } from "@/lib/media/registry";

const MediaContext = createContext<SiteImages>({});

function normalize(data: Record<string, unknown>): SiteImages {
    const out: SiteImages = {};
    for (const [key, value] of Object.entries(data)) {
        const url =
            typeof value === "string"
                ? value
                : value && typeof value === "object" && "url" in value
                  ? (value as { url?: unknown }).url
                  : undefined;
        if (typeof url === "string" && url) out[key] = url;
    }
    return out;
}

export function MediaProvider({
    initial = {},
    children,
}: {
    initial?: SiteImages;
    children: React.ReactNode;
}) {
    const [images, setImages] = useState<SiteImages>(initial);

    useEffect(() => {
        // Echtzeit: Änderungen aus dem Admin erscheinen ohne Reload.
        const unsub = onSnapshot(
            doc(db, "config", "siteImages"),
            (snap) => setImages(normalize((snap.data() ?? {}) as Record<string, unknown>)),
            () => {
                /* Rechte-/Netzwerkfehler ignorieren – Defaults bleiben aktiv. */
            },
        );
        return () => unsub();
    }, []);

    return <MediaContext.Provider value={images}>{children}</MediaContext.Provider>;
}

/** Liefert die aktuelle URL eines Slots (Override aus Firestore oder Standardbild). */
export function useMediaUrl(key: string): string {
    const images = useContext(MediaContext);
    return images[key] || DEFAULT_IMAGE_BY_KEY[key] || "";
}
