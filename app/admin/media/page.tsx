import { requireAdmin } from "@/lib/auth/session";
import { getSiteImages, getGallery, getSections } from "@/lib/media/server";
import { MediaProvider } from "@/components/media/MediaProvider";
import { SectionsProvider } from "@/components/media/SectionsProvider";
import AdminNav from "@/components/admin/AdminNav";
import MediaWorkspace from "@/components/admin/MediaWorkspace";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
    await requireAdmin();
    const [images, gallery, sections] = await Promise.all([
        getSiteImages(),
        getGallery(),
        getSections(),
    ]);

    return (
        <MediaProvider initial={images}>
            <SectionsProvider initial={sections}>
                <div className="min-h-screen bg-[#F7F3EE]">
                    <AdminNav />

                    <main className="max-w-6xl mx-auto px-6 py-10">
                        <h1 className="text-3xl font-light text-[#0B0B0B]">Homepage &amp; Medien</h1>
                        <p className="mt-1 mb-8 text-sm text-gray-500">
                            Links siehst du die Startseite von oben nach unten. Sektion anklicken, um ihre Bilder zu
                            bearbeiten – mit dem Schalter blendest du eine Sektion ein oder aus. Alles wird live übernommen.
                        </p>

                        <MediaWorkspace gallery={gallery} />
                    </main>
                </div>
            </SectionsProvider>
        </MediaProvider>
    );
}
