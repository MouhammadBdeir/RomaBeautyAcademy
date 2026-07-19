// Kopiert alle Firestore-Daten (inkl. Subcollections) und optional die
// Storage-Dateien vom alten Firebase-Projekt ins neue.
//
// Alle Zugangsdaten kommen aus .env.local:
//   Neues Projekt:  FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY,
//                   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
//   Altes Projekt:  OLD_FIREBASE_PROJECT_ID, OLD_FIREBASE_CLIENT_EMAIL,
//                   OLD_FIREBASE_PRIVATE_KEY, OLD_FIREBASE_STORAGE_BUCKET
//
// Aufruf:
//   node scripts/migrate-firebase.mjs                Firestore kopieren
//   node scripts/migrate-firebase.mjs --storage      Firestore + Storage kopieren
//   node scripts/migrate-firebase.mjs --dry-run      Nur anzeigen, was kopiert würde
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
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

const COPY_STORAGE = process.argv.includes("--storage");
const DRY_RUN = process.argv.includes("--dry-run");

function requireEnv(name) {
    const val = process.env[name];
    if (!val) {
        console.error(`❌ ${name} fehlt in .env.local`);
        process.exit(1);
    }
    return val;
}

const oldProjectId = requireEnv("OLD_FIREBASE_PROJECT_ID");
const newProjectId = requireEnv("FIREBASE_PROJECT_ID");

if (oldProjectId === newProjectId) {
    console.error("❌ OLD_FIREBASE_PROJECT_ID und FIREBASE_PROJECT_ID sind identisch – bitte prüfen.");
    process.exit(1);
}

const oldApp = initializeApp(
    {
        credential: cert({
            projectId: oldProjectId,
            clientEmail: requireEnv("OLD_FIREBASE_CLIENT_EMAIL"),
            privateKey: requireEnv("OLD_FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
        }),
        storageBucket:
            process.env.OLD_FIREBASE_STORAGE_BUCKET || `${oldProjectId}.firebasestorage.app`,
    },
    "old",
);
const newApp = initializeApp(
    {
        credential: cert({
            projectId: newProjectId,
            clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
            privateKey: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
        }),
        storageBucket:
            process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
            `${newProjectId}.firebasestorage.app`,
    },
    "new",
);

const oldDb = getFirestore(oldApp);
const newDb = getFirestore(newApp);

console.log(`Quelle:  ${oldProjectId}`);
console.log(`Ziel:    ${newProjectId}`);
if (DRY_RUN) console.log("(Dry-Run: es wird nichts geschrieben)\n");

let copiedDocs = 0;

async function copyCollection(oldCol, newCol, indent = "") {
    const snap = await oldCol.get();
    console.log(`${indent}${oldCol.path ?? oldCol.id} (${snap.size} Dokumente)`);
    for (const doc of snap.docs) {
        if (!DRY_RUN) {
            await newCol.doc(doc.id).set(doc.data());
        }
        copiedDocs++;
        // Subcollections des Dokuments ebenfalls kopieren
        const subs = await doc.ref.listCollections();
        for (const sub of subs) {
            await copyCollection(sub, newCol.doc(doc.id).collection(sub.id), indent + "  ");
        }
    }
}

async function copyFirestore() {
    const collections = await oldDb.listCollections();
    if (collections.length === 0) {
        console.log("⚠️  Keine Collections im alten Projekt gefunden.");
        return;
    }
    for (const col of collections) {
        await copyCollection(col, newDb.collection(col.id));
    }
    console.log(`\n✅ Firestore: ${copiedDocs} Dokumente ${DRY_RUN ? "gefunden" : "kopiert"}.`);
}

async function copyStorage() {
    const oldBucket = getStorage(oldApp).bucket();
    const newBucket = getStorage(newApp).bucket();
    const [files] = await oldBucket.getFiles();
    console.log(`\nStorage: ${files.length} Dateien in ${oldBucket.name}`);
    let done = 0;
    for (const file of files) {
        if (!DRY_RUN) {
            const [contents] = await file.download();
            await newBucket.file(file.name).save(contents, {
                contentType: file.metadata.contentType,
                metadata: { metadata: file.metadata.metadata },
            });
        }
        done++;
        console.log(`  [${done}/${files.length}] ${file.name}`);
    }
    console.log(`✅ Storage: ${done} Dateien ${DRY_RUN ? "gefunden" : "kopiert"}.`);
}

await copyFirestore();
if (COPY_STORAGE) await copyStorage();

console.log("\nFertig. Nächste Schritte:");
console.log("  1. Vercel-Umgebungsvariablen auf das neue Projekt umstellen");
console.log("  2. Firestore-Regeln deployen (scripts/deploy-rules.mjs)");
console.log("  3. Admin-Benutzer anlegen: npm run seed:admin");
console.log("  4. OLD_FIREBASE_* aus .env.local entfernen, sobald alles läuft");
process.exit(0);
