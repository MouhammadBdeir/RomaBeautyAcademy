"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { DEFAULT_SECTIONS, type SectionVisibility } from "@/lib/sections";

const SectionsContext = createContext<SectionVisibility>(DEFAULT_SECTIONS);

function normalize(data: Record<string, unknown>): SectionVisibility {
    const out: SectionVisibility = { ...DEFAULT_SECTIONS };
    for (const [k, v] of Object.entries(data)) {
        if (k in out && typeof v === "boolean") out[k] = v;
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
        const unsub = onSnapshot(
            doc(db, "config", "sections"),
            (snap) => setSections(normalize((snap.data() ?? {}) as Record<string, unknown>)),
            () => {},
        );
        return () => unsub();
    }, []);

    return <SectionsContext.Provider value={sections}>{children}</SectionsContext.Provider>;
}

export function useSectionVisible(id: string): boolean {
    const sections = useContext(SectionsContext);
    return sections[id] ?? true;
}

/** Rendert die Kinder nur, wenn die Sektion sichtbar geschaltet ist. */
export function SectionGate({ id, children }: { id: string; children: React.ReactNode }) {
    return useSectionVisible(id) ? <>{children}</> : null;
}
