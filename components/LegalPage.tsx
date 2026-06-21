import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Gemeinsames Layout für Rechtsseiten (Impressum, AGB, Datenschutz).
export default function LegalPage({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#F7F3EE] px-6 pt-40 pb-24 text-[#0B0B0B]">
                <div className="mx-auto max-w-2xl">
                    <h1 className="text-4xl font-light">{title}</h1>
                    <div className="mt-8 leading-relaxed text-gray-700 [&_a]:text-[#C8A24A] [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-[#0B0B0B] [&_p]:mt-2">
                        {children}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
