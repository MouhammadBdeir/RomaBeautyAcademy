// Server-seitige Lese-Helfer (Admin-SDK) für die SSR-Initialwerte.
import { adminDb, adminBucket } from "@/lib/firebase/admin";
import type { SiteImages } from "@/lib/media/registry";
import { DEFAULT_SECTIONS, type SectionVisibility } from "@/lib/sections";

export type GalleryItem = {
    id: string;
    type: "image" | "video";
    url: string;
    path: string | null;
    poster: string | null;
    order: number;
};

/** Liest die Bild-Overrides (key -> URL). Fehlerresistent (z. B. Firestore aus). */
export async function getSiteImages(): Promise<SiteImages> {
    try {
        const snap = await adminDb().collection("config").doc("siteImages").get();
        const data = (snap.data() ?? {}) as Record<string, unknown>;
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
    } catch {
        return {};
    }
}

/** Liest die Sichtbarkeit der Startseiten-Sektionen (mit Defaults gemischt). */
export async function getSections(): Promise<SectionVisibility> {
    try {
        const snap = await adminDb().collection("config").doc("sections").get();
        const data = (snap.data() ?? {}) as Record<string, unknown>;
        const out: SectionVisibility = { ...DEFAULT_SECTIONS };
        for (const [key, value] of Object.entries(data)) {
            if (key in out && typeof value === "boolean") out[key] = value;
        }
        return out;
    } catch {
        return { ...DEFAULT_SECTIONS };
    }
}

export type StorageUsage = {
    ok: boolean;
    fileCount: number;
    totalBytes: number;
    estimatedMonthlyUsd: number;
};

// Firebase Storage Speicherpreis (Blaze, EU/US) ~ 0,026 USD pro GB/Monat.
const STORAGE_USD_PER_GB_MONTH = 0.026;

/** Speichernutzung des Buckets + grobe Monatskosten-Schätzung. */
export async function getStorageUsage(): Promise<StorageUsage> {
    try {
        const [files] = await adminBucket().getFiles();
        let totalBytes = 0;
        for (const f of files) {
            const size = Number(f.metadata?.size ?? 0);
            if (!Number.isNaN(size)) totalBytes += size;
        }
        const gb = totalBytes / 1024 ** 3;
        return {
            ok: true,
            fileCount: files.length,
            totalBytes,
            estimatedMonthlyUsd: gb * STORAGE_USD_PER_GB_MONTH,
        };
    } catch {
        return { ok: false, fileCount: 0, totalBytes: 0, estimatedMonthlyUsd: 0 };
    }
}

/** Liest die Galerie-Einträge (sortiert). Fehlerresistent. */
export async function getGallery(): Promise<GalleryItem[]> {
    try {
        const snap = await adminDb().collection("gallery").orderBy("order", "asc").get();
        return snap.docs.map((d) => {
            const x = d.data();
            return {
                id: d.id,
                type: (x.type as GalleryItem["type"]) ?? "image",
                url: (x.url as string) ?? "",
                path: (x.path as string | undefined) ?? null,
                poster: (x.poster as string | undefined) ?? null,
                order: (x.order as number | undefined) ?? 0,
            };
        });
    } catch {
        return [];
    }
}
