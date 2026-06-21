"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import EditableImage from "@/components/media/EditableImage";
import { MediaProvider } from "@/components/media/MediaProvider";

export default function AboutPage() {

    const ref = useRef<HTMLDivElement | null>(null);
    const [start, setStart] = useState(false);

    // =========================
    // COUNT UP HOOK
    // =========================
    const useCountUp = (end: number, trigger: boolean) => {
        const [value, setValue] = useState(0);

        useEffect(() => {
            if (!trigger) return;

            let current = 0;
            const duration = 1200;
            const step = 16;
            const steps = duration / step;
            const inc = end / steps;

            const interval = setInterval(() => {
                current += inc;

                if (current >= end) {
                    current = end;
                    clearInterval(interval);
                }

                setValue(Math.floor(current));
            }, step);

            return () => clearInterval(interval);
        }, [trigger, end]);

        return value;
    };

    const years = useCountUp(5, start);
    const customers = useCountUp(1000, start);

    // =========================
    // SCROLL TRIGGER
    // =========================
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStart(true);
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, []);

    return (
        <MediaProvider>
            <Navbar />
                <main className="min-h-screen bg-[#F7F3EE] text-[#0B0B0B]">

                    {/* HERO */}
                    <section className="py-28 text-center px-6">

                        <p className="text-[#C8A24A] tracking-[0.3em] uppercase text-sm">
                            About Us
                        </p>

                        <h1 className="mt-4 text-5xl md:text-6xl font-light">
                            Unsere <span className="text-[#C8A24A]">Geschichte</span>
                        </h1>

                        <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
                            Wir stehen für moderne Beauty-Behandlungen mit Fokus auf natürliche Eleganz und Premium Qualität.
                        </p>

                    </section>

                    {/* CONTENT */}
                    <section
                        ref={ref}
                        className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 pb-28"
                    >

                        {/* TEXT */}
                        <div className="space-y-6">

                            <h2 className="text-3xl md:text-4xl font-light">
                                Wer wir sind
                            </h2>

                            <p className="text-gray-600 leading-relaxed">
                                Unser Studio wurde mit der Vision gegründet, Schönheit neu zu definieren –
                                natürlich, modern und individuell.
                            </p>

                            <p className="text-gray-600 leading-relaxed">
                                Jede Behandlung basiert auf Präzision, hochwertigen Produkten und einem
                                persönlichen Ansatz für jeden Kunden.
                            </p>

                            <p className="text-gray-600 leading-relaxed">
                                Wir glauben nicht an künstliche Veränderung, sondern an das Verstärken deiner natürlichen Schönheit.
                            </p>

                            {/* STATS */}
                            <div className="flex gap-10 pt-6">

                                <div>
                                    <p className="text-3xl text-[#C8A24A] font-light">
                                        {years}+
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Jahre Erfahrung
                                    </p>
                                </div>

                                <div>
                                    <p className="text-3xl text-[#C8A24A] font-light">
                                        {customers}+
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Kunden
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* IMAGE */}
                        <div className="grid gap-4">

                            <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg group">
                                <EditableImage
                                    imageKey="about_main"
                                    alt="Beauty Behandlung im Studio"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 600px"
                                    className="object-cover group-hover:scale-105 transition duration-700"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                <div className="relative h-40 rounded-2xl overflow-hidden group">
                                    <EditableImage
                                        imageKey="about_2"
                                        alt="Studio Detail"
                                        fill
                                        sizes="(max-width: 768px) 50vw, 300px"
                                        className="object-cover group-hover:scale-105 transition"
                                    />
                                </div>

                                <div className="relative h-40 rounded-2xl overflow-hidden group">
                                    <EditableImage
                                        imageKey="about_3"
                                        alt="Studio Detail"
                                        fill
                                        sizes="(max-width: 768px) 50vw, 300px"
                                        className="object-cover group-hover:scale-105 transition"
                                    />
                                </div>

                            </div>

                        </div>

                    </section>

                </main>
            <Footer />
        </MediaProvider>
    );
}