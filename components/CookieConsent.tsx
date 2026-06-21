"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "cookieConsent";
const subscribe = () => () => {};

function useIsClient() {
    return useSyncExternalStore(subscribe, () => true, () => false);
}

export default function CookieConsent() {
    const isClient = useIsClient();
    const [forceOpen, setForceOpen] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    // Wieder-Öffnen über den Footer-Button „Cookie-Einstellungen".
    useEffect(() => {
        const handler = () => {
            setForceOpen(true);
            setDismissed(false);
        };
        window.addEventListener("open-cookie-settings", handler);
        return () => window.removeEventListener("open-cookie-settings", handler);
    }, []);

    const alreadyDecided = (() => {
        if (!isClient) return true;
        try {
            return !!window.localStorage.getItem(STORAGE_KEY);
        } catch {
            return true;
        }
    })();

    const visible = isClient && !dismissed && (forceOpen || !alreadyDecided);
    if (!visible) return null;

    const decide = (value: "accepted" | "declined") => {
        try {
            window.localStorage.setItem(STORAGE_KEY, value);
        } catch {
            /* ignore */
        }
        setForceOpen(false);
        setDismissed(true);
    };

    return (
        <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl rounded-2xl border border-black/10 bg-white p-5 shadow-xl">
            <p className="text-sm font-medium text-[#0B0B0B]">Cookie-Einstellungen</p>
            <p className="mt-1 text-sm text-gray-700">
                Wir verwenden technisch notwendige Cookies für den Betrieb der Seite. Eingebettete Inhalte
                (z. B. Google&nbsp;Maps) können weitere Cookies setzen. Mehr dazu in der{" "}
                <Link href="/datenschutz" className="text-[#C8A24A] underline">
                    Datenschutzerklärung
                </Link>
                .
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
                <button
                    onClick={() => decide("accepted")}
                    className="rounded-full bg-[#C8A24A] px-5 py-2 text-sm text-black transition hover:scale-[1.03]"
                >
                    Akzeptieren
                </button>
                <button
                    onClick={() => decide("declined")}
                    className="rounded-full border border-black/10 px-5 py-2 text-sm transition hover:border-[#C8A24A]"
                >
                    Nur notwendige
                </button>
            </div>
        </div>
    );
}
