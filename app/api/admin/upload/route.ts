// Direktupload zu Firebase Storage über eine signierte URL (Admin-SDK signiert
// mit dem Service-Account-Key). Die Datei-Bytes gehen NICHT durch diese Route –
// dadurch umgehen wir das 4,5-MB-Body-Limit von Vercel-Serverless-Funktionen,
// an dem Video-Uploads online scheiterten. Weiterhin sind KEINE Storage-Rules
// nötig, und ein Download-Token macht die Datei öffentlich abrufbar.
//
// Ablauf (Client, siehe lib/media/upload.ts):
//   1) POST { folder, fileName, contentType, size }  -> { uploadUrl, path }
//   2) PUT der Datei direkt an uploadUrl (Firebase Storage)
//   3) POST { action: "finalize", path }             -> { url, path }
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

function isAllowedType(type: string, allowVideo: boolean): boolean {
    const isImage = type.startsWith("image/") && !type.includes("svg");
    const isVideo = type.startsWith("video/");
    return isImage || (allowVideo && isVideo);
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
        return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    // Schritt 3: Upload ist fertig -> Download-Token setzen und öffentliche URL liefern.
    if (body.action === "finalize") {
        const path = typeof body.path === "string" ? body.path : "";
        const folder = path.split("/")[0];
        if (!(folder in LIMITS)) {
            return NextResponse.json({ error: "Ungültiger Pfad." }, { status: 400 });
        }

        const bucket = adminBucket();
        const fileRef = bucket.file(path);
        const [exists] = await fileRef.exists();
        if (!exists) {
            return NextResponse.json({ error: "Datei nicht gefunden." }, { status: 400 });
        }

        // Token über das Admin-SDK setzen -> garantiert korrekte Schlüssel-Schreibweise.
        const token = randomUUID();
        await fileRef.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });

        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
        return NextResponse.json({ ok: true, url, path });
    }

    // Schritt 1: signierte Upload-URL erzeugen.
    const folder = body.folder;
    const contentType = typeof body.contentType === "string" ? body.contentType : "";
    const size = Number(body.size) || 0;
    const fileName = typeof body.fileName === "string" ? body.fileName : "datei";

    if (typeof folder !== "string" || !(folder in LIMITS)) {
        return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }
    const limit = LIMITS[folder];
    if (!isAllowedType(contentType, limit.allowVideo)) {
        return NextResponse.json({ error: "Dateityp nicht erlaubt." }, { status: 400 });
    }
    if (size > limit.max) {
        return NextResponse.json(
            { error: `Datei zu groß (max. ${Math.round(limit.max / 1024 / 1024)} MB).` },
            { status: 400 },
        );
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${folder}/${randomUUID()}-${safeName}`;

    const bucket = adminBucket();
    const [uploadUrl] = await bucket.file(path).getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 10 * 60 * 1000, // 10 Minuten
        contentType,
    });

    return NextResponse.json({ ok: true, uploadUrl, path, contentType });
}
