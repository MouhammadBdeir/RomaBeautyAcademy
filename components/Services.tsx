import EditableImage from "@/components/media/EditableImage";

const services = [
    { title: "Gesichtsbehandlung", desc: "Tiefenreinigung & Glow für strahlende Haut.", imageKey: "service_gesicht" },
    { title: "Wimpernverlängerung", desc: "Perfekte Länge & natürlicher Look.", imageKey: "service_wimpern" },
    { title: "Hautpflege", desc: "Individuelle Pflege für gesunde Haut.", imageKey: "service_haut" },
    { title: "Microblading", desc: "Perfekte Augenbrauen Form für dein Gesicht.", imageKey: "service_microblading" },
    { title: "Make-Up", desc: "Professionelles Make-Up für jeden Anlass.", imageKey: "service_makeup" },
    { title: "Anti-Aging", desc: "Moderne Treatments für jugendliche Haut.", imageKey: "service_antiaging" },
];

export default function Services() {
    return (
        <section id="services" className="py-28 px-6 bg-white scroll-mt-24">

            <div className="max-w-6xl mx-auto text-center">

                {/* TITLE */}
                <h2 className="text-4xl md:text-5xl font-light text-[#0B0B0B]">
                    Unsere <span className="text-[#C8A24A]">Services</span>
                </h2>

                <p className="mt-4 text-gray-600">
                    Premium Beauty Treatments für dein Wohlbefinden
                </p>

                {/* GRID */}
                <div className="mt-16 grid sm:grid-cols-2 md:grid-cols-3 gap-10">

                    {services.map((item) => (
                        <div
                            key={item.imageKey}
                            className="
                                group relative overflow-hidden
                                rounded-2xl
                                border border-black/10
                                bg-white
                                shadow-sm
                                hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]
                                transition-all duration-500
                                hover:-translate-y-2
                            "
                        >

                            {/* IMAGE */}
                            <div className="relative h-60 overflow-hidden">
                                <EditableImage
                                    imageKey={item.imageKey}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                    className="object-cover group-hover:scale-110 transition duration-700"
                                />
                            </div>

                            {/* CONTENT */}
                            <div className="p-6 text-left">

                                <h3 className="text-lg font-medium text-[#0B0B0B]">
                                    {item.title}
                                </h3>

                                <p className="mt-2 text-gray-600 text-sm">
                                    {item.desc}
                                </p>

                                {/* GOLD LINE */}
                                <div className="mt-4 h-[2px] w-0 bg-[#C8A24A] group-hover:w-24 transition-all duration-500" />

                            </div>

                        </div>
                    ))}

                </div>

            </div>

        </section>
    );
}
