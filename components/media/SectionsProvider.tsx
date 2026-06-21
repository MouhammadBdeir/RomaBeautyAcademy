"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_SECTIONS, type SectionVisibility } from "@/lib/sections";

type SectionsContextValue = {
    sections: SectionVisibility;
    setLocal: (id: string, value: boolean) => void;
};

const SectionsContext = createContext<SectionsContextValue>({
    sections: DEFAULT_SECTIONS,
    setLocal: () => {},
});

function merge(data: unknown): SectionVisibility {
    const out: SectionVisibility = { ...DEFAULT_SECTIONS };
    if (data && typeof data === "object") {
        for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
            if (k in out && typeof v === "boolean") out[k] = v;
        }
    }
    return out;
}

export function SectionsProvider({
    initial,
    children,
}: {
    initial?: SectionVisibility;
    children: React.ReactNode;
}) {
    const [sections, setSections] = useState<SectionVisibility>(initial ?? DEFAULT_SECTIONS);

    useEffect(() => {
        let active = true;
        let timer: ReturnType<typeof setTimeout>;

        const tick = async () => {
            try {
                const res = await fetch("/api/site-state", { cache: "no-store" });
                if (active && res.ok) {
                    const data = await res.json();
                    setSections(merge(data?.sections));
                }
            } catch {
                /* ignorieren */
            }
            if (active) {
                const hidden = typeof document !== "undefined" && document.visibilityState === "hidden";
                timer = setTimeout(tick, hidden ? 20000 : 4000);
            }
        };

        tick();
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, []);

    // Optimistisches Setzen: Admin-UI reagiert sofort; das Polling bestätigt.
    const setLocal = useCallback((id: string, value: boolean) => {
        setSections((prev) => ({ ...prev, [id]: value }));
    }, []);

    return (
        <SectionsContext.Provider value={{ sections, setLocal }}>{children}</SectionsContext.Provider>
    );
}

export function useSectionVisible(id: string): boolean {
    return useContext(SectionsContext).sections[id] ?? true;
}

export function useSetSectionVisible() {
    return useContext(SectionsContext).setLocal;
}

/** Rendert die Kinder nur, wenn die Sektion sichtbar geschaltet ist. */
export function SectionGate({ id, children }: { id: string; children: React.ReactNode }) {
    return useSectionVisible(id) ? <>{children}</> : null;
}
