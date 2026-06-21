// Client-seitige Bild-Komprimierung/Resize via Canvas.
// Hält die Auflösung im Griff und reduziert die Dateigröße deutlich,
// bevor etwas zu Firebase Storage hochgeladen wird.

export type ResizeResult = {
    file: File;
    width: number;
    height: number;
    sizeBytes: number;
};

export async function compressImage(
    input: File,
    opts: { maxDimension?: number; quality?: number; mimeType?: "image/webp" | "image/jpeg" } = {},
): Promise<ResizeResult> {
    const maxDimension = opts.maxDimension ?? 2000;
    const quality = opts.quality ?? 0.85;
    const mimeType = opts.mimeType ?? "image/webp";

    const bitmap = await createImageBitmap(input);
    let width = bitmap.width;
    let height = bitmap.height;

    if (width > maxDimension || height > maxDimension) {
        const scale = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas-Kontext nicht verfügbar.");
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Komprimierung fehlgeschlagen."))),
            mimeType,
            quality,
        ),
    );

    const ext = mimeType === "image/webp" ? "webp" : "jpg";
    const baseName = input.name.replace(/\.[^.]+$/, "") || "bild";
    const file = new File([blob], `${baseName}.${ext}`, { type: mimeType });

    return { file, width, height, sizeBytes: file.size };
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
