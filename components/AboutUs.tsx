"use client";

import EditableImage from "@/components/media/EditableImage";
import { useEffect, useRef, useState } from "react";

function useCountUp(end: number, startTrigger: boolean, duration = 1200) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!startTrigger) return;

        let current = 0;
        const stepTime = 16;
        const steps = duration / stepTime;
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
    }, [startTrigger, end, duration]);

    return value;
}

export default function AboutUs() {
    const [start, setStart] = useState(false);
    const hasStarted = useRef(false);

    const years = useCountUp(5, start);
    const customers = useCountUp(1000, start);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted.current) {
                    hasStarted.current = true;
                    setStart(true);
                }
            },
            {
                threshold: 0.3, // früher trigger → zuverlässiger
                rootMargin: "0px 0px -100px 0px"
            }
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

                    <h2 className="text-4xl md:text-5xl font-light text-[#0B0B0B]">
                        Über <span className="text-[#C8A24A]">uns</span>
                    </h2>

                    <p className="mt-6 text-gray-600 leading-relaxed">
                        Unser Studio steht für moderne, hochwertige Beauty-Behandlungen.
                    </p>

                    <p className="mt-4 text-gray-600 leading-relaxed">
                        Wir kombinieren Techniken und Pflege für natürliche Ergebnisse.
                    </p>

                    <p className="mt-4 text-gray-600 leading-relaxed">
                        Jede Behandlung wird individuell abgestimmt.
                    </p>

                    <div className="mt-6 flex gap-6 text-sm text-[#0B0B0B]">

                        <div>
                            <span className="text-[#C8A24A] font-medium">
                                {years}+
                            </span>{" "}
                            Jahre Erfahrung
                        </div>

                        <div>
                            <span className="text-[#C8A24A] font-medium">
                                {customers}+
                            </span>{" "}
                            Kunden
                        </div>

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