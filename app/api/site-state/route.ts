// Öffentlicher Zustand der Website (Bilder, Galerie, Sektions-Sichtbarkeit,
// Kontaktdaten) über das Admin-SDK gelesen. Wird vom Client gepollt -> Echtzeit
// ohne dass Firestore-Read-Rules deployt sein müssen. Alles hier ist öffentlich.
import { NextResponse } from "next/server";
import { getSiteImages, getGallery, getSections } from "@/lib/media/server";
import { getContactData } from "@/lib/contact/server";
import { getContent } from "@/lib/content/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const [images, gallery, sections, contact, content] = await Promise.all([
        getSiteImages(),
        getGallery(),
        getSections(),
        getContactData(),
        getContent(),
    ]);

    return NextResponse.json(
        { images, gallery, sections, contact, content },
        { headers: { "Cache-Control": "no-store" } },
    );
}
