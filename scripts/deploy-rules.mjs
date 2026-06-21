// Deployt firestore.rules + storage.rules über die Firebase Security Rules API,
// authentifiziert mit dem Admin-SDK-Service-Account aus .env.local.
//
// Aufruf:  npm run deploy:rules
import { cert } from "firebase-admin/app";
import { readFileSync } from "node:fs";

function loadEnvLocal() {
    try {
        const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
        for (const line of raw.split(/\r?\n/)) {
            const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
            if (!m) continue;
            let val = m[2];
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            if (!(m[1] in process.env)) process.env[m[1]] = val;
        }
    } catch {
        /* ohne .env.local gelten die gesetzten Variablen */
    }
}
loadEnvLocal();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
let bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY fehlen in .env.local");
    process.exit(1);
}
// gs://… oder Domain ohne Schema normalisieren
if (bucket) bucket = bucket.replace(/^gs:\/\//, "");

const credential = cert({ projectId, clientEmail, privateKey });
const { access_token } = await credential.getAccessToken();

async function api(url, method, body) {
    const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${url}\n  -> ${res.status}: ${text}`);
    return text ? JSON.parse(text) : {};
}

async function createRuleset(fileName, content) {
    const r = await api(
        `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
        "POST",
        { source: { files: [{ name: fileName, content }] } },
    );
    return r.name; // projects/{p}/rulesets/{id}
}

async function setRelease(releaseId, rulesetName) {
    const name = `projects/${projectId}/releases/${releaseId}`;
    try {
        await api(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`, "POST", {
            name,
            rulesetName,
        });
        return "erstellt";
    } catch (e) {
        if (/(\b409\b|already exists)/i.test(String(e))) {
            await api(`https://firebaserules.googleapis.com/v1/${name}`, "PATCH", {
                release: { name, rulesetName },
            });
            return "aktualisiert";
        }
        throw e;
    }
}

async function deploy(label, file, releaseId) {
    const content = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    const ruleset = await createRuleset(file, content);
    const action = await setRelease(releaseId, ruleset);
    console.log(`✅ ${label}: ${action} (${ruleset.split("/").pop()})`);
}

try {
    await deploy("Firestore-Rules", "firestore.rules", "cloud.firestore");
    if (bucket) {
        await deploy("Storage-Rules", "storage.rules", `firebase.storage/${bucket}`);
    } else {
        console.warn("⚠️  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET fehlt – Storage-Rules übersprungen.");
    }
    console.log("\n🎉 Fertig. Uploads sollten jetzt funktionieren.");
    process.exit(0);
} catch (err) {
    console.error("\n❌ Deploy fehlgeschlagen:\n" + (err?.message ?? err));
    process.exit(1);
}
