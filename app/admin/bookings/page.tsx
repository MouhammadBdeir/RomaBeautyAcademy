import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/session";
import { getBookings } from "@/lib/bookings/server";
import { getGermanHolidays } from "@/lib/holidays";
import { getSettings } from "@/lib/settings/server";
import AdminNav from "@/components/admin/AdminNav";
import BookingsManager from "@/components/admin/BookingsManager";
import { getAdminT } from "@/lib/i18n/admin-server";

export const dynamic = "force-dynamic";

function todayKeyUTC(): string {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default async function AdminBookingsPage() {
    await requireAdmin();
    const now = new Date();
    const [{ t }, bookings, holidays, settings] = await Promise.all([
        getAdminT(),
        getBookings(),
        getGermanHolidays([now.getUTCFullYear(), now.getUTCFullYear() + 1]),
        getSettings(),
    ]);

    return (
        <div className="min-h-screen bg-[#F7F3EE]">
            <AdminNav />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <h1 className="text-3xl font-light text-[#0B0B0B]">{t("Buchungen")}</h1>
                <p className="mt-1 mb-8 text-sm text-gray-500">
                    {t(
                        "Terminanfragen verwalten – im Kalender einen Tag wählen, dann bestätigen oder absagen (auch nach der Bestätigung änderbar).",
                    )}
                </p>
                <Suspense>
                    <BookingsManager initial={bookings} holidays={holidays} todayKey={todayKeyUTC()} settings={settings} />
                </Suspense>
            </main>
        </div>
    );
}
