'use client';

export default function Home() {
    return (
        <main className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 to-white px-6">
                <div className="max-w-4xl text-center">
                    <span className="mb-4 inline-block rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-600">
                        Professionelle Kosmetik & Beauty
                    </span>

                    <h1 className="mb-6 text-5xl font-bold md:text-7xl">
                        Schönheit beginnt mit Pflege
                    </h1>

                    <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
                        Entdecken Sie hochwertige Kosmetikbehandlungen für ein
                        strahlendes Aussehen und mehr Wohlbefinden.
                    </p>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <button className="rounded-full bg-pink-500 px-8 py-4 font-semibold text-white transition hover:bg-pink-600">
                            Termin buchen
                        </button>

                        <button className="rounded-full border border-gray-300 px-8 py-4 font-semibold transition hover:bg-gray-100">
                            Mehr erfahren
                        </button>
                    </div>
                </div>
            </section>

            {/* Leistungen */}
            <section className="px-6 py-24">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold">
                            Unsere Leistungen
                        </h2>
                        <p className="text-gray-600">
                            Individuelle Behandlungen für Ihre Schönheit und Ihr Wohlbefinden.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="rounded-3xl border p-8 shadow-sm">
                            <h3 className="mb-3 text-2xl font-semibold">
                                Gesichtsbehandlung
                            </h3>
                            <p className="text-gray-600">
                                Tiefenreinigung, Pflege und Regeneration für Ihre Haut.
                            </p>
                        </div>

                        <div className="rounded-3xl border p-8 shadow-sm">
                            <h3 className="mb-3 text-2xl font-semibold">
                                Wimpern & Augenbrauen
                            </h3>
                            <p className="text-gray-600">
                                Perfekte Akzente für einen ausdrucksstarken Blick.
                            </p>
                        </div>

                        <div className="rounded-3xl border p-8 shadow-sm">
                            <h3 className="mb-3 text-2xl font-semibold">
                                Hautpflege
                            </h3>
                            <p className="text-gray-600">
                                Individuelle Pflegekonzepte für jeden Hauttyp.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Über uns */}
            <section className="bg-pink-50 px-6 py-24">
                <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
                    <div>
                        <h2 className="mb-6 text-4xl font-bold">
                            Über Uns
                        </h2>

                        <p className="mb-4 text-gray-600">
                            Unser Kosmetikstudio steht für Qualität,
                            Professionalität und individuelle Beratung.
                        </p>

                        <p className="text-gray-600">
                            Wir nehmen uns Zeit für Ihre Wünsche und sorgen
                            dafür, dass Sie sich rundum wohlfühlen.
                        </p>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="h-80 w-full rounded-3xl bg-pink-200" />
                    </div>
                </div>
            </section>

            {/* Kontakt */}
            <section className="px-6 py-24">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="mb-4 text-4xl font-bold">
                        Vereinbaren Sie einen Termin
                    </h2>

                    <p className="mb-8 text-gray-600">
                        Wir freuen uns darauf, Sie in unserem Studio begrüßen zu dürfen.
                    </p>

                    <button className="rounded-full bg-pink-500 px-8 py-4 font-semibold text-white transition hover:bg-pink-600">
                        Jetzt Kontakt aufnehmen
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t px-6 py-8">
                <div className="mx-auto max-w-6xl text-center text-sm text-gray-500">
                    © 2026 Beauty Studio. Alle Rechte vorbehalten.
                </div>
            </footer>
        </main>
    );
}