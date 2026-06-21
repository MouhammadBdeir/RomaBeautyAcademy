// Galerie verwalten: Eintrag (Foto/Video) hinzufügen oder löschen. Nur Admin.
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminBucket } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";

function isStorageUrl(url: unknown): url is string {
    return typeof url === "string" && url.startsWith("https://firebasestorage.googleapis.com/");
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const type = body?.type === "video" ? "video" : body?.type === "image" ? "image" : null;
    const url = body?.url;
    const path = typeof body?.path === "string" ? body.path : null;

    if (!type) {
        return NextResponse.json({ error: "Typ fehlt (image/video)." }, { status: 400 });
    }
    if (!isStorageUrl(url) || !path) {
        return NextResponse.json({ error: "Ungültige Medien-URL." }, { status: 400 });
    }

    // nächste Sortier-Nummer
    const last = await adminDb().collection("gallery").orderBy("order", "desc").limit(1).get();
    const nextOrder = last.empty ? 0 : ((last.docs[0].data().order as number | undefined) ?? 0) + 1;

    const docRef = await adminDb().collection("gallery").add({
        type,
        url,
        path,
        poster: null,
        order: nextOrder,
        createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, id: docRef.id });
}

export async function DELETE(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "id fehlt." }, { status: 400 });
    }

    const docRef = adminDb().collection("gallery").doc(id);
    const path = (await docRef.get()).data()?.path as string | undefined;

    await docRef.delete();
    if (path) {
        await adminBucket().file(path).delete().catch(() => {});
    }

    return NextResponse.json({ ok: true });
}
