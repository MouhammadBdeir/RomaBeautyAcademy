// Server-seitiger Datei-Upload via Admin-SDK. Umgeht Storage-Rules komplett
// (Admin-SDK ist privilegiert) und vergibt einen Download-Token, sodass die
// Datei ohne Read-Rule öffentlich abrufbar ist. -> keine Storage-Rules nötig.
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { adminBucket } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITS: Record<string, { max: number; allowVideo: boolean }> = {
    "website-images": { max: 8 * 1024 * 1024, allowVideo: false },
    gallery: { max: 50 * 1024 * 1024, allowVideo: true },
};

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const form = await request.formData().catch(() => null);
    const folder = form?.get("folder");
    const file = form?.get("file");

    if ((folder !== "website-images" && folder !== "gallery") || !(file instanceof File)) {
        return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    const limit = LIMITS[folder];
    const type = file.type || "application/octet-stream";
    const isImage = type.startsWith("image/") && !type.includes("svg");
    const isVideo = type.startsWith("video/");

    if (!isImage && !(limit.allowVideo && isVideo)) {
        return NextResponse.json({ error: "Dateityp nicht erlaubt." }, { status: 400 });
    }
    if (file.size > limit.max) {
        return NextResponse.json(
            { error: `Datei zu groß (max. ${Math.round(limit.max / 1024 / 1024)} MB).` },
            { status: 400 },
        );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = (file.name || "datei").replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${folder}/${randomUUID()}-${safeName}`;
    const token = randomUUID();

    const bucket = adminBucket();
    await bucket.file(path).save(buffer, {
        resumable: false,
        contentType: type,
        metadata: { metadata: { firebaseStorageDownloadTokens: token } },
    });

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;

    return NextResponse.json({ ok: true, url, path });
}
