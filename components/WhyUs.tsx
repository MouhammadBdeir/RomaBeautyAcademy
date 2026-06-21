"use client";

import {
    ShieldCheckIcon,
    SparklesIcon,
    HeartIcon,
    TrophyIcon,
    StarIcon,
} from "@heroicons/react/24/outline";
import { useContent } from "@/components/media/MediaProvider";

const ICONS = [ShieldCheckIcon, SparklesIcon, HeartIcon, TrophyIcon, StarIcon];

export default function WhyUs() {
    const { whyus } = useContent();

    return (
        <section className="py-28 px-6 bg-white">
            <div className="max-w-6xl mx-auto">

                <div className="text-center">
                    <p className="text-[#C8A24A] uppercase tracking-[0.25em] text-sm">{whyus.eyebrow}</p>
                    <h2 className="mt-4 text-4xl md:text-5xl font-light">{whyus.heading}</h2>
                </div>

                <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {whyus.cards.map((item, index) => {
                        const Icon = ICONS[index % ICONS.length];
                        return (
                            <div
                                key={item.id}
                                className="group bg-[#F7F3EE] rounded-3xl p-8 border border-black/5 hover:border-[#C8A24A]/40 hover:-translate-y-2 transition-all duration-500"
                            >
                                <Icon className="w-10 h-10 text-[#C8A24A]" />
                                <h3 className="mt-5 text-xl font-medium">{item.title}</h3>
                                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{item.text}</p>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
