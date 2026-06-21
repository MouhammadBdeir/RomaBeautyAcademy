// Upload läuft über die geschützte Server-Route /api/admin/upload (Admin-SDK).
// Dadurch sind KEINE Firebase-Storage-Rules nötig. Fortschritt via XHR.

export type UploadHandle = {
    promise: Promise<{ url: string; path: string }>;
    cancel: () => void;
};

export function uploadFile(
    file: File,
    folder: "website-images" | "gallery",
    onProgress?: (percent: number) => void,
): UploadHandle {
    const xhr = new XMLHttpRequest();

    const promise = new Promise<{ url: string; path: string }>((resolve, reject) => {
        const fd = new FormData();
        fd.append("folder", folder);
        fd.append("file", file);

        xhr.open("POST", "/api/admin/upload");

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const r = JSON.parse(xhr.responseText);
                    resolve({ url: r.url, path: r.path });
                } catch {
                    reject(new Error("Ungültige Server-Antwort."));
                }
            } else {
                let msg = "Upload fehlgeschlagen.";
                try {
                    msg = JSON.parse(xhr.responseText).error ?? msg;
                } catch {
                    /* ignore */
                }
                reject(new Error(msg));
            }
        };

        xhr.onerror = () => reject(new Error("Netzwerkfehler beim Upload."));
        xhr.send(fd);
    });

    return { promise, cancel: () => xhr.abort() };
}
