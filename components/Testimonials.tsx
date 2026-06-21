"use client";

const reviews = [
    {
        name: "Sarah M.",
        text: "Absolut professionelle Behandlung. Das Ergebnis hat meine Erwartungen übertroffen."
    },
    {
        name: "Jessica K.",
        text: "Wunderschöne Atmosphäre und sehr freundliche Beratung. Ich komme definitiv wieder."
    },
    {
        name: "Anna L.",
        text: "Die beste Beauty-Behandlung, die ich bisher hatte. Sehr empfehlenswert."
    }
];

export default function Testimonials() {
    return (
        <section className="py-28 px-6 bg-white">

            <div className="max-w-6xl mx-auto">

                <div className="text-center">
                    <p className="text-[#C8A24A] uppercase tracking-[0.25em] text-sm">
                        Bewertungen
                    </p>

                    <h2 className="mt-4 text-4xl md:text-5xl font-light">
                        Das sagen unsere Kunden
                    </h2>
                </div>

                <div className="mt-16 grid md:grid-cols-3 gap-6">

                    {reviews.map((review, index) => (
                        <div
                            key={index}
                            className="
                                p-8
                                rounded-3xl
                                bg-[#F7F3EE]
                                border
                                border-black/5
                                hover:border-[#C8A24A]/40
                                hover:-translate-y-2
                                transition-all
                                duration-500
                            "
                        >
                            <div className="text-[#C8A24A] text-xl">
                                ★★★★★
                            </div>

                            <p className="mt-4 text-gray-600 leading-relaxed">
                                &bdquo;{review.text}&ldquo;
                            </p>

                            <div className="mt-6 font-medium">
                                {review.name}
                            </div>
                        </div>
                    ))}

                </div>

            </div>

        </section>
    );
}