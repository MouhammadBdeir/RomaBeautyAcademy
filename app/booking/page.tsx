import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/booking/BookingForm";
import { getGermanHolidays } from "@/lib/holidays";
import { getContactData } from "@/lib/contact/server";
import { getContent } from "@/lib/content/server";
import { getSettings, guardMaintenance } from "@/lib/settings/server";

export const dynamic = "force-dynamic";

function todayKeyUTC(): string {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default async function BookingPage() {
    await guardMaintenance();
    const now = new Date();
    const [holidays, contact, settings, content] = await Promise.all([
        getGermanHolidays([now.getUTCFullYear(), now.getUTCFullYear() + 1]),
        getContactData(),
        getSettings(),
        getContent(),
    ]);
    const services = content.services.items.map((s) => ({ id: s.id, title: s.title }));

    return (
        <>
            <Navbar />
            <Suspense>
                <BookingForm
                    holidays={holidays}
                    todayKey={todayKeyUTC()}
                    contact={contact}
                    settings={settings}
                    services={services}
                />
            </Suspense>
            <Footer />
        </>
    );
}
