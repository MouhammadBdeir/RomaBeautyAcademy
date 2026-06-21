"use client";

import { motion } from "framer-motion";
import EditableImage from "@/components/media/EditableImage";

export default function Hero() {
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">

            {/* BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <EditableImage
                    imageKey="hero_bg"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover scale-105"
                />

                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#F7F3EE]" />
            </div>

            {/* CONTENT */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative z-10 text-center max-w-5xl"
            >

                <p className="text-[#C8A24A] tracking-[0.3em] uppercase text-sm">
                    Luxury Beauty Studio
                </p>

                <h1 className="mt-6 text-5xl md:text-7xl font-light leading-tight text-white">
                    Schönheit in ihrer <br /> reinsten Form
                </h1>

                <p className="mt-6 text-white/80 text-lg max-w-2xl mx-auto">
                    Premium Kosmetik mit Fokus auf natürliche Eleganz und Glow.
                </p>

                {/* BUTTONS */}
                <div className="mt-10 flex justify-center gap-4">
                    <a href="#contact" className="px-8 py-4 bg-[#C8A24A] text-black rounded-full hover:scale-105 transition">
                        Termin buchen
                    </a>

                    <a href="#services" className="px-8 py-4 border border-white/40 text-white rounded-full hover:bg-white/10 transition">
                        Mehr erfahren
                    </a>
                </div>

                {/* IMAGES */}
                <div className="mt-14 grid grid-cols-3 gap-4 items-center">

                    {/* BIG IMAGE */}
                    <div className="relative col-span-2 h-72 overflow-hidden rounded-2xl shadow-lg group">
                        <EditableImage
                            imageKey="hero_main"
                            alt="Beauty Behandlung"
                            fill
                            sizes="(max-width: 768px) 66vw, 600px"
                            className="object-cover group-hover:scale-105 transition duration-700"
                        />
                    </div>

                    {/* RIGHT STACK */}
                    <div className="flex flex-col gap-4">

                        <div className="relative h-32 overflow-hidden rounded-2xl shadow-md group">
                            <EditableImage
                                imageKey="hero_small1"
                                alt="Beauty Detail 1"
                                fill
                                sizes="(max-width: 768px) 33vw, 300px"
                                className="object-cover group-hover:scale-105 transition duration-700"
                            />
                        </div>

                        <div className="relative h-32 overflow-hidden rounded-2xl shadow-md group">
                            <EditableImage
                                imageKey="hero_small2"
                                alt="Beauty Detail 2"
                                fill
                                sizes="(max-width: 768px) 33vw, 300px"
                                className="object-cover group-hover:scale-105 transition duration-700"
                            />
                        </div>

                    </div>

                </div>

            </motion.div>

        </section>
    );
}
