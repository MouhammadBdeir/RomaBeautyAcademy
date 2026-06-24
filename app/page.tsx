import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import AboutUs from "@/components/AboutUs";
import Contact from "@/components/Contact";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import GalleryLive from "@/components/media/GalleryLive";
import { MediaProvider } from "@/components/media/MediaProvider";
import { SectionsProvider, SectionGate } from "@/components/media/SectionsProvider";
import { getSiteImages, getGallery, getSections } from "@/lib/media/server";
import { getContent } from "@/lib/content/server";
import { getGermanHolidays } from "@/lib/holidays";
import { getSettings, guardMaintenance } from "@/lib/settings/server";

// Inhalte kommen aus Firestore -> pro Request frisch; client-seitig hält
// onSnapshot Bilder, Galerie und Sektions-Sichtbarkeit zusätzlich in Echtzeit.
export const dynamic = "force-dynamic";

export default async function Home() {
    await guardMaintenance();
    const nowYear = new Date().getFullYear();
    const [images, gallery, sections, content, holidays, settings] = await Promise.all([
        getSiteImages(),
        getGallery(),
        getSections(),
        getContent(),
        getGermanHolidays([nowYear, nowYear + 1]),
        getSettings(),
    ]);

    return (
        <MediaProvider initial={images} initialContent={content}>
            <SectionsProvider initial={sections}>
                <main className="bg-[#F7F3EE] text-[#0B0B0B]">
                    <Navbar />
                    <SectionGate id="hero">
                        <Hero />
                    </SectionGate>
                    <SectionGate id="services">
                        <Services />
                    </SectionGate>
                    <SectionGate id="whyus">
                        <WhyUs />
                    </SectionGate>
                    <SectionGate id="gallery">
                        <GalleryLive initial={gallery} />
                    </SectionGate>
                    <SectionGate id="testimonials">
                        <Testimonials />
                    </SectionGate>
                    <SectionGate id="about">
                        <AboutUs />
                    </SectionGate>
                    <SectionGate id="contact">
                        <Contact holidays={holidays} settings={settings} />
                    </SectionGate>
                    <Footer />
                </main>
            </SectionsProvider>
        </MediaProvider>
    );
}
