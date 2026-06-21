// Legt den Owner-Admin an bzw. aktualisiert ihn:
//   E-Mail:   bdeiromar97@gmail.com
//   Passwort: 12345678
//   Claims:   { admin: true, owner: true }
//
// Aufruf:  npm run seed:admin
//
// Hinweis: Ein Standalone-Node-Skript lädt .env.local NICHT automatisch,
// daher der kleine Parser unten.
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "node:fs";

function loadEnvLocal() {
    try {
        const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
        for (const line of raw.split(/\r?\n/)) {
            const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
            if (!m) continue;
            let val = m[2];
            if (
                (val.startsWith('"') && val.endsWith('"')) ||
                (val.startsWith("'") && val.endsWith("'"))
            ) {
                val = val.slice(1, -1);
            }
            if (!(m[1] in process.env)) process.env[m[1]] = val;
        }
    } catch {
        // .env.local fehlt -> es gelten bereits gesetzte Umgebungsvariablen.
    }
}

loadEnvLocal();

const EMAIL = "bdeiromar97@gmail.com";
const PASSWORD = "12345678";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
    console.error(
        "❌ Firebase Admin Credentials fehlen. Bitte FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL und FIREBASE_PRIVATE_KEY in .env.local setzen.",
    );
    process.exit(1);
}

if (!getApps().length) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const auth = getAuth();

async function main() {
    let user;
    try {
        user = await auth.getUserByEmail(EMAIL);
        await auth.updateUser(user.uid, { password: PASSWORD, emailVerified: true });
        console.log("ℹ️  Benutzer existierte bereits – Passwort aktualisiert:", user.uid);
    } catch (err) {
        if (err && err.code === "auth/user-not-found") {
            user = await auth.createUser({ email: EMAIL, password: PASSWORD, emailVerified: true });
            console.log("✅ Benutzer erstellt:", user.uid);
        } else {
            throw err;
        }
    }

    await auth.setCustomUserClaims(user.uid, { admin: true, owner: true });
    console.log(`✅ Claims gesetzt: admin + owner für ${EMAIL}`);
    console.log("   Du kannst dich jetzt unter /admin/login anmelden.");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Seed fehlgeschlagen:", err?.message ?? err);
        process.exit(1);
    });
