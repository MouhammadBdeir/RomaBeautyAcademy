// Firebase Admin-SDK (nur Server). NIEMALS in eine Client-Komponente importieren.
// Init ist lazy, damit der Build nicht versucht, Credentials zu laden.
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let cachedApp: App | null = null;

function getAdminApp(): App {
    if (cachedApp) return cachedApp;

    const existing = getApps();
    if (existing.length) {
        cachedApp = existing[0];
        return cachedApp;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // In .env.local steht der Key meist mit literalen \n -> echte Zeilenumbrüche.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Firebase Admin SDK nicht konfiguriert: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL und FIREBASE_PRIVATE_KEY in .env.local setzen.",
        );
    }

    cachedApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
    });
    return cachedApp;
}

export function adminAuth(): Auth {
    return getAuth(getAdminApp());
}

export function adminDb(): Firestore {
    return getFirestore(getAdminApp());
}

export function adminBucket() {
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || undefined;
    return getStorage(getAdminApp()).bucket(bucketName);
}
