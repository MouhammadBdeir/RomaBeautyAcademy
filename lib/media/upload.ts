// Client-seitiger Upload zu Firebase Storage mit Fortschritts-Callback.
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, auth } from "@/lib/firebase/client";

export type UploadHandle = {
    promise: Promise<{ url: string; path: string }>;
    cancel: () => void;
};

export function uploadFile(
    file: File,
    folder: "website-images" | "gallery",
    onProgress?: (percent: number) => void,
): UploadHandle {
    if (!auth.currentUser) {
        return {
            promise: Promise.reject(
                new Error("Nicht eingeloggt. Bitte melde dich erneut an, um hochzuladen."),
            ),
            cancel: () => {},
        };
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
    const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });

    const promise = new Promise<{ url: string; path: string }>((resolve, reject) => {
        task.on(
            "state_changed",
            (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            (err) => reject(err),
            async () => {
                try {
                    const url = await getDownloadURL(task.snapshot.ref);
                    resolve({ url, path });
                } catch (err) {
                    reject(err);
                }
            },
        );
    });

    return { promise, cancel: () => task.cancel() };
}
