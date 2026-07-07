// Upload läuft in drei Schritten (siehe app/api/admin/upload/route.ts):
//   1) signierte Upload-URL von der geschützten Route holen (Admin-SDK)
//   2) Datei DIREKT zu Firebase Storage laden -> umgeht das 4,5-MB-Body-Limit
//      von Vercel, an dem Video-Uploads online scheiterten
//   3) Download-Token setzen lassen und öffentliche URL erhalten
// Dadurch sind KEINE Firebase-Storage-Rules nötig. Fortschritt via XHR (Schritt 2).

export type UploadHandle = {
    promise: Promise<{ url: string; path: string }>;
    cancel: () => void;
};

async function errorFrom(res: Response, fallback: string): Promise<Error> {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return new Error(data?.error ?? fallback);
}

export function uploadFile(
    file: File,
    folder: "website-images" | "gallery",
    onProgress?: (percent: number) => void,
): UploadHandle {
    let xhr: XMLHttpRequest | null = null;
    let aborted = false;

    const promise = (async () => {
        const contentType = file.type || "application/octet-stream";

        // 1. Signierte Upload-URL holen.
        const signRes = await fetch("/api/admin/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder, fileName: file.name, contentType, size: file.size }),
        });
        if (!signRes.ok) throw await errorFrom(signRes, "Upload fehlgeschlagen.");
        const { uploadUrl, path } = (await signRes.json()) as { uploadUrl: string; path: string };
        if (aborted) throw new Error("Abgebrochen.");

        // 2. Datei direkt zu Firebase Storage laden (mit Fortschritt).
        await new Promise<void>((resolve, reject) => {
            xhr = new XMLHttpRequest();
            xhr.open("PUT", uploadUrl);
            xhr.setRequestHeader("Content-Type", contentType);
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
            };
            xhr.onload = () =>
                xhr!.status >= 200 && xhr!.status < 300
                    ? resolve()
                    : reject(new Error("Upload fehlgeschlagen."));
            xhr.onerror = () => reject(new Error("Netzwerkfehler beim Upload."));
            xhr.send(file);
        });

        // 3. Download-Token setzen lassen und öffentliche URL erhalten.
        const finRes = await fetch("/api/admin/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "finalize", path }),
        });
        if (!finRes.ok) throw await errorFrom(finRes, "Upload fehlgeschlagen.");
        const r = (await finRes.json()) as { url: string; path: string };
        return { url: r.url, path: r.path };
    })();

    return {
        promise,
        cancel: () => {
            aborted = true;
            xhr?.abort();
        },
    };
}
