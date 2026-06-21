// Sichtbarkeit einer Startseiten-Sektion umschalten. Nur Admin.
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";
import { isValidSection } from "@/lib/sections";

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const id = body?.id;
    const visible = body?.visible;

    if (typeof id !== "string" || !isValidSection(id) || typeof visible !== "boolean") {
        return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    await adminDb().collection("config").doc("sections").set({ [id]: visible }, { merge: true });
    return NextResponse.json({ ok: true });
}
