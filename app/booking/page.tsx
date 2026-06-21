import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/booking/BookingForm";
import { getGermanHolidays } from "@/lib/holidays";
import { getContactData } from "@/lib/contact/server";

export const dynamic = "force-dynamic";

function todayKeyUTC(): string {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default async function BookingPage() {
    const now = new Date();
    const [holidays, contact] = await Promise.all([
        getGermanHolidays([now.getUTCFullYear(), now.getUTCFullYear() + 1]),
        getContactData(),
    ]);

    return (
        <>
            <Navbar />
            <BookingForm holidays={holidays} todayKey={todayKeyUTC()} contact={contact} />
            <Footer />
        </>
    );
}
