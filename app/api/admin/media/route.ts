// Setzt/zurücksetzt ein Bild für einen Slot der Website. Nur Admin.
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminBucket } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";
import { isValidSlot } from "@/lib/media/registry";

function isStorageUrl(url: unknown): url is string {
    return typeof url === "string" && url.startsWith("https://firebasestorage.googleapis.com/");
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const key = body?.key;
    const url = body?.url;
    const path = typeof body?.path === "string" ? body.path : null;

    if (typeof key !== "string" || !isValidSlot(key)) {
        return NextResponse.json({ error: "Unbekannter Bild-Slot." }, { status: 400 });
    }
    if (!isStorageUrl(url)) {
        return NextResponse.json({ error: "Ungültige Bild-URL." }, { status: 400 });
    }

    const docRef = adminDb().collection("config").doc("siteImages");
    const prev = (await docRef.get()).data() ?? {};
    const prevPath = (prev?.[key] as { path?: string } | undefined)?.path;

    await docRef.set(
        { [key]: { url, path, updatedAt: FieldValue.serverTimestamp() } },
        { merge: true },
    );

    // Vorgängerdatei best-effort aufräumen (keine Waisen im Storage).
    if (prevPath && prevPath !== path) {
        await adminBucket().file(prevPath).delete().catch(() => {});
    }

    return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const key = new URL(request.url).searchParams.get("key");
    if (!key || !isValidSlot(key)) {
        return NextResponse.json({ error: "Unbekannter Bild-Slot." }, { status: 400 });
    }

    const docRef = adminDb().collection("config").doc("siteImages");
    const prev = (await docRef.get()).data() ?? {};
    const prevPath = (prev?.[key] as { path?: string } | undefined)?.path;

    await docRef.set({ [key]: FieldValue.delete() }, { merge: true });

    if (prevPath) {
        await adminBucket().file(prevPath).delete().catch(() => {});
    }

    return NextResponse.json({ ok: true });
}
