import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content/server";
import { getContactData } from "@/lib/contact/server";
import { guardMaintenance } from "@/lib/settings/server";

export const dynamic = "force-dynamic";

const HIGHLIGHTS = [
    "Individuelle Beratung",
    "Premium-Produkte",
    "Höchste Hygiene-Standards",
    "Bequeme Online-Terminbuchung",
];

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const content = await getContent();
    const service = content.services.items.find((s) => s.slug === slug);
    return {
        title: service ? `${service.title} — RomaBeautyAcademy` : "Service",
        description: service?.short,
    };
}

export default async function ServiceDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    await guardMaintenance();
    const { slug } = await params;
    const [content, contact] = await Promise.all([getContent(), getContactData()]);

    const service = content.services.items.find((s) => s.slug === slug);
    if (!service) notFound();

    const others = content.services.items.filter((s) => s.slug !== slug);

    return (
        <>
            <Navbar />

            <main className="bg-[#F7F3EE] text-[#0B0B0B]">

                {/* HERO */}
                <section className="relative flex min-h-[460px] items-end overflow-hidden md:h-[60vh]">
                    {service.imageUrl && (
                        <Image src={service.imageUrl} alt={service.title} fill priority sizes="100vw" className="object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

                    <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-12">
                        <Link href="/#services" className="text-sm text-white/80 transition hover:text-[#C8A24A]">
                            ← Alle Services
                        </Link>
                        <p className="mt-5 text-sm uppercase tracking-[0.25em] text-[#C8A24A]">Service</p>
                        <h1 className="mt-2 text-4xl font-light text-white md:text-6xl">{service.title}</h1>
                        <p className="mt-3 max-w-2xl text-white/80">{service.short}</p>
                    </div>
                </section>

                {/* INHALT */}
                <section className="mx-auto grid max-w-5xl gap-12 px-6 py-20 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-light text-[#0B0B0B]">Über diese Behandlung</h2>
                        <div className="mt-4 whitespace-pre-line leading-relaxed text-gray-700">{service.long}</div>

                        <div className="mt-10 grid gap-3 sm:grid-cols-2">
                            {HIGHLIGHTS.map((h) => (
                                <div key={h} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C8A24A] text-sm text-black">
                                        ✓
                                    </span>
                                    <span className="text-sm text-gray-700">{h}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA-SIDEBAR */}
                    <aside>
                        <div className="sticky top-28 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-medium text-[#0B0B0B]">Termin vereinbaren</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Sichere dir deinen Wunschtermin – schnell und unkompliziert online.
                            </p>
                            <Link
                                href="/booking"
                                className="mt-5 block rounded-full bg-[#C8A24A] px-6 py-3 text-center font-medium text-black transition hover:scale-[1.02]"
                            >
                                Termin buchen
                            </Link>
                            {contact.phone && (
                                <p className="mt-4 text-sm text-gray-500">
                                    Oder ruf an:{" "}
                                    <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="text-[#C8A24A] hover:underline">
                                        {contact.phone}
                                    </a>
                                </p>
                            )}
                        </div>
                    </aside>
                </section>

                {/* WEITERE SERVICES */}
                {others.length > 0 && (
                    <section className="bg-white px-6 py-20">
                        <div className="mx-auto max-w-6xl">
                            <h2 className="text-center text-3xl font-light text-[#0B0B0B]">Weitere Services</h2>
                            <p className="mt-3 text-center text-gray-600">Entdecke unsere weiteren Behandlungen</p>

                            <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                                {others.map((s) => (
                                    <Link
                                        key={s.id}
                                        href={`/services/${s.slug}`}
                                        className="group block overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]"
                                    >
                                        <div className="relative h-52 overflow-hidden bg-[#F7F3EE]">
                                            {s.imageUrl && (
                                                <Image
                                                    src={s.imageUrl}
                                                    alt={s.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                    className="object-cover transition duration-700 group-hover:scale-110"
                                                />
                                            )}
                                        </div>
                                        <div className="p-6 text-left">
                                            <h3 className="text-lg font-medium text-[#0B0B0B]">{s.title}</h3>
                                            <p className="mt-2 text-sm text-gray-600">{s.short}</p>
                                            <span className="mt-4 inline-block text-sm text-[#C8A24A] group-hover:underline">
                                                Mehr erfahren →
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

            </main>

            <Footer />
        </>
    );
}
