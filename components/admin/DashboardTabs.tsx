"use client";

import { useState, type ReactNode } from "react";

export type DashboardTab = { id: string; label: string; content: ReactNode };

export default function DashboardTabs({ tabs }: { tabs: DashboardTab[] }) {
    const [active, setActive] = useState(tabs[0]?.id);
    const current = tabs.find((t) => t.id === active) ?? tabs[0];

    return (
        <div>
            <div className="flex gap-1 overflow-x-auto border-b border-black/10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {tabs.map((t) => {
                    const on = t.id === active;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActive(t.id)}
                            className={`-mb-px shrink-0 whitespace-nowrap rounded-t-xl border-b-2 px-3 py-2.5 text-sm font-medium transition sm:px-4 ${
                                on
                                    ? "border-[#C8A24A] text-[#0B0B0B]"
                                    : "border-transparent text-gray-500 hover:text-[#C8A24A]"
                            }`}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>
            <div className="mt-6">{current?.content}</div>
        </div>
    );
}
