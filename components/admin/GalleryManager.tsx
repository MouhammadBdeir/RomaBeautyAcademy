"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { compressImage, formatBytes } from "@/lib/media/resize";
import { uploadFile } from "@/lib/media/upload";
import type { GalleryItem } from "@/lib/media/server";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function errMsg(err: unknown): string {
    return err instanceof Error ? err.message : "Etwas ist schiefgelaufen.";
}

export default function GalleryManager({ initial = [] }: { initial?: GalleryItem[] }) {
    const [items, setItems] = useState<GalleryItem[]>(initial);
    const [progress, setProgress] = useState<number | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const photoInput = useRef<HTMLInputElement>(null);
    const videoInput = useRef<HTMLInputElement>(null);

    async function postGallery(payload: { type: "image" | "video"; url: string; path: string }) {
        const res = await fetch("/api/admin/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.error ?? "Speichern fehlgeschlagen.");
        }
        // optimistisch anzeigen, auch ohne Firestore-Live
        if (typeof data.id === "string") {
            setItems((prev) => [
                ...prev,
                { id: data.id, type: payload.type, url: payload.url, path: payload.path, poster: null, order: prev.length },
            ]);
        }
    }

    async function addPhoto(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        setBusy(true);
        setError(null);
        try {
            setStatus("Komprimiere …");
            const { file: compressed, width, height, sizeBytes } = await compressImage(file, {
                maxDimension: 2000,
            });
            setStatus(`Lade hoch … ${width}×${height}, ${formatBytes(sizeBytes)}`);
            setProgress(0);
            const { promise } = uploadFile(compressed, "gallery", setProgress);
            const { url, path } = await promise;
            await postGallery({ type: "image", url, path });
            setStatus("Foto hinzugefügt ✓");
        } catch (err) {
            setError(errMsg(err));
        } finally {
            setBusy(false);
            setProgress(null);
        }
    }

    async function addVideo(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (file.size > MAX_VIDEO_BYTES) {
            setError(`Video zu groß (${formatBytes(file.size)}). Maximal 50 MB.`);
            return;
        }

        setBusy(true);
        setError(null);
        try {
            setStatus(`Lade Video hoch … ${formatBytes(file.size)}`);
            setProgress(0);
            const { promise } = uploadFile(file, "gallery", setProgress);
            const { url, path } = await promise;
            await postGallery({ type: "video", url, path });
            setStatus("Video hinzugefügt ✓");
        } catch (err) {
            setError(errMsg(err));
        } finally {
            setBusy(false);
            setProgress(null);
        }
    }

    async function remove(id: string) {
        if (!window.confirm("Diesen Eintrag wirklich löschen?")) return;
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/gallery?id=${encodeURIComponent(id)}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error ?? "Löschen fehlgeschlagen.");
            }
        } catch (err) {
            setError(errMsg(err));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={() => photoInput.current?.click()}
                    disabled={busy}
                    className="px-5 py-2 rounded-full bg-[#C8A24A] text-black text-sm hover:scale-[1.03] transition disabled:opacity-50"
                >
                    + Foto
                </button>
                <button
                    onClick={() => videoInput.current?.click()}
                    disabled={busy}
                    className="px-5 py-2 rounded-full border border-black/10 text-sm hover:border-[#C8A24A] transition disabled:opacity-50"
                >
                    + Video
                </button>

                {status && <span className="text-xs text-green-600">{status}</span>}
                {error && <span className="text-xs text-red-600">{error}</span>}
            </div>

            {progress !== null && (
                <div className="mt-4 h-2 rounded-full bg-black/10">
                    <div
                        className="h-full rounded-full bg-[#C8A24A] transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {items.length === 0 ? (
                <p className="mt-5 text-sm text-gray-500">Noch keine Einträge.</p>
            ) : (
                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {items.map((item) => (
                        <div key={item.id} className="relative h-32 overflow-hidden rounded-xl bg-black/5 group">
                            {item.type === "video" ? (
                                <video src={item.url} className="w-full h-full object-cover" muted preload="metadata" />
                            ) : (
                                <Image src={item.url} alt="" fill sizes="200px" unoptimized className="object-cover" />
                            )}

                            <span className="absolute top-1 left-1 text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-white">
                                {item.type === "video" ? "Video" : "Foto"}
                            </span>

                            <button
                                onClick={() => remove(item.id)}
                                disabled={busy}
                                aria-label="Löschen"
                                className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white text-sm opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <input ref={photoInput} type="file" accept="image/*" onChange={addPhoto} className="hidden" />
            <input ref={videoInput} type="file" accept="video/*" onChange={addVideo} className="hidden" />
        </div>
    );
}
