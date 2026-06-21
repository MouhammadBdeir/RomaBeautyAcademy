"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/lib/media/server";

export default function GalleryLive({ initial = [] }: { initial?: GalleryItem[] }) {
    const [items, setItems] = useState<GalleryItem[]>(initial);

    useEffect(() => {
        let active = true;
        let timer: ReturnType<typeof setTimeout>;

        const tick = async () => {
            try {
                const res = await fetch("/api/site-state", { cache: "no-store" });
                if (active && res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data?.gallery)) setItems(data.gallery as GalleryItem[]);
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

    return (
        <section id="gallery" className="py-28 px-6 bg-[#F7F3EE] scroll-mt-24">
            <div className="max-w-6xl mx-auto">
                <div className="text-center">
                    <p className="text-[#C8A24A] uppercase tracking-[0.25em] text-sm">Galerie</p>
                    <h2 className="mt-4 text-4xl md:text-5xl font-light">Unsere Arbeiten</h2>
                </div>

                {items.length === 0 ? (
                    <p className="mt-16 text-center text-gray-500">Noch keine Einträge.</p>
                ) : (
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {items.map((item) => (
                            <GalleryCell key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function GalleryCell({ item }: { item: GalleryItem }) {
    if (item.type === "video") {
        return (
            <div className="relative h-72 overflow-hidden rounded-3xl bg-black">
                <video
                    src={item.url}
                    poster={item.poster ?? undefined}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    return (
        <div className="relative h-72 overflow-hidden rounded-3xl group">
            <Image
                src={item.url}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
        </div>
    );
}
