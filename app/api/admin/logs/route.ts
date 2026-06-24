// Protokoll lesen. Nur Admin.
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { getLogs } from "@/lib/logs/server";

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const raw = Number(new URL(request.url).searchParams.get("limit"));
    const limit = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 300) : 100;
    const logs = await getLogs(limit);
    return NextResponse.json({ logs });
}
