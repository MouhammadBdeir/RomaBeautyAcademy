// Navbar-Stil / Branding speichern. Nur Admin – wirkt sofort (kosmetisch).
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";
import { mergeBranding } from "@/lib/branding/types";
import { addLog } from "@/lib/logs/server";

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const clean = mergeBranding(body);
    await adminDb().collection("config").doc("branding").set(clean);
    await addLog({ category: "admin", message: `Navbar-Stil: ${clean.navbarStyle}`, actor: session.email ?? session.uid });

    return NextResponse.json({ ok: true, ...clean });
}
