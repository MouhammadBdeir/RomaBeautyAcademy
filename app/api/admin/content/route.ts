// Textinhalte der Startseite speichern. Nur Admin.
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";
import { mergeContent } from "@/lib/content/types";

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    // Über mergeContent normalisieren/begrenzen (verhindert Schemaverschmutzung).
    const clean = mergeContent(body);
    await adminDb().collection("config").doc("content").set(clean);

    return NextResponse.json({ ok: true });
}
