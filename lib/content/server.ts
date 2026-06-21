// Server-seitiges Lesen der Textinhalte (Admin-SDK).
import { adminDb } from "@/lib/firebase/admin";
import { mergeContent, type SiteContent } from "./types";

export async function getContent(): Promise<SiteContent> {
    try {
        const snap = await adminDb().collection("config").doc("content").get();
        return mergeContent(snap.data());
    } catch {
        return mergeContent(null);
    }
}
