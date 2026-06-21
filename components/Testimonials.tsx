"use client";

import { useContent } from "@/components/media/MediaProvider";

export default function Testimonials() {
    const { testimonials } = useContent();

    return (
        <section className="py-28 px-6 bg-white">
            <div className="max-w-6xl mx-auto">

                <div className="text-center">
                    <p className="text-[#C8A24A] uppercase tracking-[0.25em] text-sm">{testimonials.eyebrow}</p>
                    <h2 className="mt-4 text-4xl md:text-5xl font-light">{testimonials.heading}</h2>
                </div>

                <div className="mt-16 grid md:grid-cols-3 gap-6">
                    {testimonials.reviews.map((review) => (
                        <div
                            key={review.id}
                            className="p-8 rounded-3xl bg-[#F7F3EE] border border-black/5 hover:border-[#C8A24A]/40 hover:-translate-y-2 transition-all duration-500"
                        >
                            <div className="text-[#C8A24A] text-xl">
                                {"★".repeat(Math.max(1, Math.min(5, review.rating)))}
                            </div>
                            <p className="mt-4 text-gray-600 leading-relaxed">&bdquo;{review.text}&ldquo;</p>
                            <div className="mt-6 font-medium">{review.name}</div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
