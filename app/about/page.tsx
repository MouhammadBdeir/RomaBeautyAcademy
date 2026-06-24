import AboutContent from "@/components/AboutContent";
import { guardMaintenance } from "@/lib/settings/server";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
    await guardMaintenance();
    return <AboutContent />;
}
