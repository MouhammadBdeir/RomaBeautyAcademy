import './globals.css';
import type { Metadata } from 'next';
import CookieConsent from '@/components/CookieConsent';

// In Produktion NEXT_PUBLIC_SITE_URL setzen (z. B. https://www.romabeautyacademy.de).
// Robust: akzeptiert auch eine Domain ohne Protokoll und stürzt nie ab.
function resolveSiteUrl(): URL {
    const raw = process.env.NEXT_PUBLIC_SITE_URL;
    if (raw) {
        try {
            return new URL(/^https?:\/\//.test(raw) ? raw : `https://${raw}`);
        } catch {
            /* ungültiger Wert -> Fallback unten */
        }
    }
    return new URL('http://localhost:3000');
}

export const metadata: Metadata = {
    metadataBase: resolveSiteUrl(),
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