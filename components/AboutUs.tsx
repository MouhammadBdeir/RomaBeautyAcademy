"use client";

import EditableImage from "@/components/media/EditableImage";
import { useContent } from "@/components/media/MediaProvider";
import { useEffect, useState } from "react";

function useCountUp(end: number, run: boolean, duration = 1400) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!run) return;

        let current = 0;
        const stepTime = 16;
        const steps = Math.max(1, Math.floor(duration / stepTime));
        const increment = end / steps;

        const interval = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(interval);
            }
            setValue(Math.floor(current));
        }, stepTime);

        return () => clearInterval(interval);
    }, [run, end, duration]);

    return value;
}

function StatCounter({ value, suffix }: { value: number; suffix: string }) {
    const n = useCountUp(value, true);
    return (
        <span className="text-[#C8A24A] font-medium">
            {n}
            {suffix}
        </span>
    );
}

export default function AboutUs() {
    const { about } = useContent();
    // Steigt bei jedem Sichtbarwerden -> Zähler animieren immer neu von 0.
    const [runKey, setRunKey] = useState(0);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setRunKey((k) => k + 1);
            },
            { threshold: 0.3, rootMargin: "0px 0px -100px 0px" },
        );

        const el = document.getElementById("about");
        if (el) observer.observe(el);
        return () => {
            if (el) observer.unobserve(el);
        };
    }, []);

    return (
        <section id="about" className="py-28 bg-[#F7F3EE] px-6 scroll-mt-24">

            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">

                {/* TEXT */}
                <div className="opacity-0 animate-fadeIn">
                    <p className="text-[#C8A24A] tracking-[0.25em] uppercase text-sm">{about.eyebrow}</p>

                    <h2 className="mt-3 text-4xl md:text-5xl font-light text-[#0B0B0B]">{about.heading}</h2>

                    {about.paragraphs.map((p, i) => (
                        <p key={i} className="mt-4 text-gray-600 leading-relaxed">{p}</p>
                    ))}

                    <div className="mt-6 flex flex-wrap gap-8 text-sm text-[#0B0B0B]">
                        {about.stats.map((s) => (
                            <div key={s.id}>
                                {runKey > 0 ? (
                                    <StatCounter key={`${s.id}-${runKey}`} value={s.value} suffix={s.suffix} />
                                ) : (
                                    <span className="text-[#C8A24A] font-medium">0{s.suffix}</span>
                                )}{" "}
                                {s.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* IMAGE */}
                <div className="opacity-0 animate-fadeIn delay-150">
                    <div className="relative h-80 rounded-2xl overflow-hidden border border-black/10 shadow-sm group">
                        <EditableImage
                            imageKey="about_home"
                            alt="Über uns"
                            fill
                            sizes="(max-width: 768px) 100vw, 600px"
                            className="object-cover group-hover:scale-105 transition duration-700"
                        />
                    </div>
                </div>

            </div>

        </section>
    );
}
