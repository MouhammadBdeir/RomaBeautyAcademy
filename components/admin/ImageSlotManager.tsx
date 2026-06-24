"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useMediaUrl } from "@/components/media/MediaProvider";
import { compressImage, formatBytes } from "@/lib/media/resize";
import { uploadFile } from "@/lib/media/upload";
import type { MediaSlot } from "@/lib/media/registry";
import { useConfirm } from "./ConfirmDialog";

export default function ImageSlotManager({ slot }: { slot: MediaSlot }) {
    const currentUrl = useMediaUrl(slot.key);
    const inputRef = useRef<HTMLInputElement>(null);
    const { confirm, dialog } = useConfirm();

    const [preview, setPreview] = useState<string | null>(null);
    const [savedUrl, setSavedUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        setError(null);
        setStatus(null);
        setBusy(true);

        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);

        try {
            setStatus("Komprimiere …");
            const { file: compressed, width, height, sizeBytes } = await compressImage(file, {
                maxDimension: 2000,
            });

            setStatus(`Lade hoch … ${width}×${height}, ${formatBytes(sizeBytes)}`);
            setProgress(0);
            const { promise } = uploadFile(compressed, "website-images", setProgress);
            const { url, path } = await promise;

            const res = await fetch("/api/admin/media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: slot.key, url, path }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error ?? "Speichern fehlgeschlagen.");
            }
            setSavedUrl(url); // sofort anzeigen, auch ohne Firestore-Live
            setStatus("Gespeichert ✓");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload fehlgeschlagen.");
        } finally {
            setBusy(false);
            setProgress(null);
            setPreview(null);
            URL.revokeObjectURL(localUrl);
        }
    }

    async function reset() {
        if (busy) return;
        const ok = await confirm({
            title: "Auf Standard zurücksetzen?",
            message: "Dein hochgeladenes Bild wird entfernt und das Standardbild wieder angezeigt.",
            confirmLabel: "Zurücksetzen",
            tone: "danger",
        });
        if (!ok) return;
        setBusy(true);
        setError(null);
        setStatus(null);
        try {
            const res = await fetch(`/api/admin/media?key=${encodeURIComponent(slot.key)}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error ?? "Zurücksetzen fehlgeschlagen.");
            }
            setSavedUrl(null);
            setStatus("Auf Standard zurückgesetzt ✓");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Fehler.");
        } finally {
            setBusy(false);
        }
    }

    const shown = preview ?? savedUrl ?? currentUrl;

    return (
        <div className="rounded-2xl border border-black/10 bg-white p-4">
            <div
                className="relative w-full overflow-hidden rounded-xl bg-[#F7F3EE]"
                style={{ aspectRatio: slot.aspect }}
            >
                {shown && (
                    <Image src={shown} alt={slot.label} fill sizes="320px" unoptimized className="object-cover" />
                )}

                {progress !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="w-3/4">
                            <div className="h-2 rounded-full bg-white/30">
                                <div
                                    className="h-full rounded-full bg-[#C8A24A] transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="mt-2 text-center text-xs text-white">{progress}%</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-3">
                <p className="text-sm font-medium text-[#0B0B0B]">{slot.label}</p>
                <p className="text-xs text-gray-500">{slot.where}</p>
                <p className="mt-1 inline-block rounded-md bg-[#C8A24A]/10 px-2 py-0.5 text-xs text-[#8a6d24]">
                    Empfohlen: {slot.recommended} · {slot.aspect.replace("/", ":")}
                </p>
            </div>

            {status && <p className="mt-2 text-xs text-green-600">{status}</p>}
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

            <div className="mt-3 flex gap-2">
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                    className="px-4 py-2 rounded-full bg-[#C8A24A] text-black text-sm hover:scale-[1.03] transition disabled:opacity-50"
                >
                    Bild ändern
                </button>
                <button
                    onClick={reset}
                    disabled={busy}
                    className="px-4 py-2 rounded-full border border-black/10 text-sm hover:border-[#C8A24A] transition disabled:opacity-50"
                >
                    Standard
                </button>
            </div>

            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {dialog}
        </div>
    );
}
