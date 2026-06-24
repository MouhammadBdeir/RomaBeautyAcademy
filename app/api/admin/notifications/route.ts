// Benachrichtigungen lesen & verwalten. Nur Admin.
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/session";
import { getNotifications } from "@/lib/notifications/server";

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const includeArchived = new URL(request.url).searchParams.get("archived") === "1";
    const notifications = await getNotifications(includeArchived);
    return NextResponse.json({ notifications });
}

const ACTIONS = ["read", "archive", "unarchive", "delete"] as const;
type Action = (typeof ACTIONS)[number];

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session || !session.admin) {
        return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const id = body?.id;
    const action = body?.action as Action;
    if (typeof id !== "string" || !ACTIONS.includes(action)) {
        return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    const ref = adminDb().collection("notifications").doc(id);

    if (action === "delete") {
        const data = (await ref.get()).data();
        if (!data) {
            return NextResponse.json({ error: "Benachrichtigung nicht gefunden." }, { status: 404 });
        }
        // Offene Anfragen dürfen nicht weggeklickt werden.
        if (data.status === "pending") {
            return NextResponse.json(
                {
                    error: "Solange die Anfrage offen ist, lässt sie sich nicht löschen. Bestätige oder sage den Termin zuerst ab.",
                },
                { status: 400 },
            );
        }
        await ref.delete();
        return NextResponse.json({ ok: true });
    }

    const patch: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (action === "read") patch.read = true;
    if (action === "archive") patch.archived = true;
    if (action === "unarchive") patch.archived = false;
    await ref.set(patch, { merge: true });

    return NextResponse.json({ ok: true });
}
