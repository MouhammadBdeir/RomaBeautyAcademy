// Server-seitiges Lesen des Brandings (Admin-SDK).
import { adminDb } from "@/lib/firebase/admin";
import { mergeBranding, type BrandingData } from "./types";

export async function getBranding(): Promise<BrandingData> {
    try {
        const snap = await adminDb().collection("config").doc("branding").get();
        return mergeBranding(snap.data());
    } catch {
        return mergeBranding(null);
    }
}
