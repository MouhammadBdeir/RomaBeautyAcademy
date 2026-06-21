// Kontaktdaten speichern. Nur Admin.
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";

function str(v: unknown, max = 300): string {
    return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    const social = Array.isArray(body.social)
        ? body.social
              .slice(0, 30)
              .map((s: Record<string, unknown>, i: number) => ({
                  id: str(s?.id, 50) || String(i),
                  label: str(s?.label, 50),
                  url: str(s?.url, 500),
              }))
              .filter((s: { url: string }) => s.url)
        : [];

    const data = {
        email: str(body.email),
        phone: str(body.phone),
        street: str(body.street),
        zip: str(body.zip, 20),
        city: str(body.city),
        country: str(body.country),
        managingDirector: str(body.managingDirector),
        registerCourt: str(body.registerCourt),
        hrb: str(body.hrb, 100),
        vatId: str(body.vatId, 100),
        social,
    };

    // Vollständig ersetzen, damit entfernte Social-Links auch wirklich weg sind.
    await adminDb().collection("config").doc("contactData").set(data);

    return NextResponse.json({ ok: true });
}
