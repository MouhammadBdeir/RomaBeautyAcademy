"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ConfirmOptions = {
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: "default" | "danger";
};

/**
 * Promise-basierter Bestätigungs-Dialog – ersetzt window.confirm().
 *
 *   const { confirm, dialog } = useConfirm();
 *   if (await confirm({ title: "Löschen?", tone: "danger" })) { … }
 *   // {dialog} irgendwo im JSX rendern.
 */
export function useConfirm() {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const resolver = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            resolver.current = resolve;
            setOptions(opts);
        });
    }, []);

    const settle = useCallback((result: boolean) => {
        resolver.current?.(result);
        resolver.current = null;
        setOptions(null);
    }, []);

    const dialog = options ? (
        <ConfirmDialog options={options} onConfirm={() => settle(true)} onCancel={() => settle(false)} />
    ) : null;

    return { confirm, dialog };
}

function ConfirmDialog({
    options,
    onConfirm,
    onCancel,
}: {
    options: ConfirmOptions;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const { title, message, confirmLabel = "Bestätigen", cancelLabel = "Abbrechen", tone = "default" } = options;

    // Escape schließt, Body-Scroll sperren solange offen.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onCancel]);

    const confirmCls =
        tone === "danger"
            ? "rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            : "rounded-full bg-[#C8A24A] px-5 py-2 text-sm font-medium text-black transition hover:scale-[1.03]";

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="animate-overlayIn absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
                aria-hidden="true"
            />
            <div
                role="alertdialog"
                aria-modal="true"
                aria-label={title}
                className="animate-dialogIn relative w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-2xl"
            >
                <h3 className="text-lg font-medium text-[#0B0B0B]">{title}</h3>
                {message && <p className="mt-2 text-sm leading-relaxed text-gray-500 whitespace-pre-line">{message}</p>}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded-full border border-black/10 px-5 py-2 text-sm transition hover:border-[#C8A24A]"
                    >
                        {cancelLabel}
                    </button>
                    <button onClick={onConfirm} autoFocus className={confirmCls}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

// ───────────────────────── Auswahl-Dialog (mehrere Optionen) ─────────────────────────

export type Choice = { value: string; label: string; tone?: "default" | "danger" | "ghost" };

export type ChoiceOptions = {
    title: string;
    message?: string;
    choices: Choice[];
    cancelLabel?: string;
};

/**
 * Wie useConfirm, aber mit mehreren Optionen. Gibt den gewählten Wert (oder null) zurück.
 *
 *   const { choose, dialog } = useChoice();
 *   const v = await choose({ title: "…", choices: [{ value: "archive", label: "Archivieren" }] });
 */
export function useChoice() {
    const [options, setOptions] = useState<ChoiceOptions | null>(null);
    const resolver = useRef<((value: string | null) => void) | null>(null);

    const choose = useCallback((opts: ChoiceOptions) => {
        return new Promise<string | null>((resolve) => {
            resolver.current = resolve;
            setOptions(opts);
        });
    }, []);

    const settle = useCallback((result: string | null) => {
        resolver.current?.(result);
        resolver.current = null;
        setOptions(null);
    }, []);

    const dialog = options ? (
        <ChoiceDialog options={options} onPick={(v) => settle(v)} onCancel={() => settle(null)} />
    ) : null;

    return { choose, dialog };
}

function ChoiceDialog({
    options,
    onPick,
    onCancel,
}: {
    options: ChoiceOptions;
    onPick: (value: string) => void;
    onCancel: () => void;
}) {
    const { title, message, choices, cancelLabel = "Abbrechen" } = options;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onCancel]);

    const toneCls = (tone: Choice["tone"]) =>
        tone === "danger"
            ? "rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
            : tone === "ghost"
              ? "rounded-full border border-black/10 px-5 py-2.5 text-sm transition hover:border-[#C8A24A]"
              : "rounded-full bg-[#C8A24A] px-5 py-2.5 text-sm font-medium text-black transition hover:scale-[1.02]";

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="animate-overlayIn absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
                aria-hidden="true"
            />
            <div
                role="alertdialog"
                aria-modal="true"
                aria-label={title}
                className="animate-dialogIn relative w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-2xl"
            >
                <h3 className="text-lg font-medium text-[#0B0B0B]">{title}</h3>
                {message && <p className="mt-2 text-sm leading-relaxed text-gray-500 whitespace-pre-line">{message}</p>}
                <div className="mt-6 flex flex-col gap-2">
                    {choices.map((c) => (
                        <button key={c.value} onClick={() => onPick(c.value)} className={toneCls(c.tone)}>
                            {c.label}
                        </button>
                    ))}
                    <button onClick={onCancel} className="mt-1 px-5 py-2 text-sm text-gray-500 transition hover:text-[#0B0B0B]">
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
