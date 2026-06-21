"use client";

import Image from "next/image";
import Link from "next/link";
import { useContent } from "@/components/media/MediaProvider";

export default function Services() {
    const { services } = useContent();

    return (
        <section id="services" className="py-28 px-6 bg-white scroll-mt-24">

            <div className="max-w-6xl mx-auto text-center">

                <h2 className="text-4xl md:text-5xl font-light text-[#0B0B0B]">{services.heading}</h2>
                <p className="mt-4 text-gray-600">{services.subtitle}</p>

                <div className="mt-16 grid sm:grid-cols-2 md:grid-cols-3 gap-10">
                    {services.items.map((item) => (
                        <Link
                            key={item.id}
                            href={`/services/${item.slug}`}
                            className="
                                group relative block overflow-hidden text-left
                                rounded-2xl border border-black/10 bg-white shadow-sm
                                hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]
                                transition-all duration-500 hover:-translate-y-2
                            "
                        >
                            <div className="relative h-60 overflow-hidden bg-[#F7F3EE]">
                                {item.imageUrl && (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                        className="object-cover group-hover:scale-110 transition duration-700"
                                    />
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-medium text-[#0B0B0B]">{item.title}</h3>
                                <p className="mt-2 text-gray-600 text-sm">{item.short}</p>
                                <div className="mt-4 h-[2px] w-0 bg-[#C8A24A] group-hover:w-24 transition-all duration-500" />
                            </div>
                        </Link>
                    ))}
                </div>

            </div>

        </section>
    );
}
