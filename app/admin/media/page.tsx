import { requireAdmin } from "@/lib/auth/session";
import { getSiteImages, getGallery, getSections } from "@/lib/media/server";
import { getContent } from "@/lib/content/server";
import { getBranding } from "@/lib/branding/server";
import { MediaProvider } from "@/components/media/MediaProvider";
import { SectionsProvider } from "@/components/media/SectionsProvider";
import AdminNav from "@/components/admin/AdminNav";
import MediaWorkspace from "@/components/admin/MediaWorkspace";
import { getAdminT } from "@/lib/i18n/admin-server";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
    await requireAdmin();
    const [{ t }, images, gallery, sections, content, branding] = await Promise.all([
        getAdminT(),
        getSiteImages(),
        getGallery(),
        getSections(),
        getContent(),
        getBranding(),
    ]);

    return (
        <MediaProvider initial={images} initialContent={content}>
            <SectionsProvider initial={sections}>
                <div className="min-h-screen bg-[#F7F3EE]">
                    <AdminNav />

                    <main className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 sm:py-10">
                        <h1 className="text-3xl font-light text-[#0B0B0B]">{t("Homepage & Medien")}</h1>
                        <p className="mt-1 mb-8 text-sm text-gray-500">
                            {t("Links siehst du die Startseite von oben nach unten. Sektion anklicken, um ihre Bilder zu bearbeiten – mit dem Schalter blendest du eine Sektion ein oder aus. Alles wird live übernommen.")}
                        </p>

                        <MediaWorkspace gallery={gallery} initialContent={content} navbarStyle={branding.navbarStyle} />
                    </main>
                </div>
            </SectionsProvider>
        </MediaProvider>
    );
}
