// Bestätigt eine angefragte Einstellungs-Änderung über den Token aus der Owner-Mail.
// Öffentlich erreichbar (der Owner klickt aus der E-Mail) – abgesichert über den Token.
import { adminDb } from "@/lib/firebase/admin";
import { addLog } from "@/lib/logs/server";

export const dynamic = "force-dynamic";

function page(title: string, message: string, ok: boolean): Response {
    const color = ok ? "#15803d" : "#b91c1c";
    const html =
        `<!doctype html><html lang="de"><head><meta charset="utf-8">` +
        `<meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>` +
        `<body style="margin:0;background:#F7F3EE;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0B0B0B">` +
        `<div style="max-width:460px;margin:12vh auto;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:18px;padding:40px;text-align:center">` +
        `<div style="letter-spacing:0.25em;font-weight:700;font-size:14px"><span style="color:#C8A24A">RomaBeauty</span>Academy</div>` +
        `<h1 style="margin-top:24px;font-weight:400;font-size:22px;color:${color}">${title}</h1>` +
        `<p style="margin-top:12px;font-size:14px;color:#6b7280">${message}</p>` +
        `</div></body></html>`;
    return new Response(html, {
        status: ok ? 200 : 400,
        headers: { "content-type": "text/html; charset=utf-8" },
    });
}

export async function GET(request: Request) {
    const token = new URL(request.url).searchParams.get("token");
    if (!token) return page("Ungültiger Link", "Es fehlt ein gültiger Bestätigungs-Code.", false);

    const ref = adminDb().collection("config").doc("settingsPending");
    const data = (await ref.get()).data();
    if (!data || data.token !== token) {
        return page("Link ungültig", "Dieser Link ist ungültig oder wurde bereits verwendet.", false);
    }

    // 24 Stunden gültig.
    const createdMs = (data.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
    if (createdMs && Date.now() - createdMs > 24 * 60 * 60 * 1000) {
        await ref.delete().catch(() => {});
        return page("Link abgelaufen", "Bitte die Änderung im Admin-Bereich erneut anfragen.", false);
    }

    await adminDb().collection("config").doc("settings").set(data.settings, { merge: true });
    await ref.delete().catch(() => {});
    await addLog({
        category: "admin",
        message: "Einstellungen per Owner-Bestätigung übernommen",
        actor: (data.requestedBy as string) ?? "Owner",
    });

    return page("Einstellungen übernommen ✓", "Die Änderungen sind jetzt aktiv. Du kannst dieses Fenster schließen.", true);
}
