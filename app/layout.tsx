import './globals.css';
import type { Metadata } from 'next';
import CookieConsent from '@/components/CookieConsent';

// In Produktion NEXT_PUBLIC_SITE_URL setzen (z. B. https://www.romabeautyacademy.de).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: 'RomaBeautyAcademy — Luxury Beauty Studio',
    description:
        'Premium Kosmetik mit Fokus auf natürliche Eleganz und Glow. Gesichtsbehandlung, Wimpernverlängerung, Microblading, Make-Up und Anti-Aging.',
    openGraph: {
        title: 'RomaBeautyAcademy — Luxury Beauty Studio',
        description: 'Premium Kosmetik mit Fokus auf natürliche Eleganz und Glow.',
        type: 'website',
        locale: 'de_DE',
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="de">
        <body>
        {children}
        <CookieConsent />
        </body>
        </html>
    );
}