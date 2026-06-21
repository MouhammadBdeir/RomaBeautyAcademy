import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
// Wenn Auth-Domain bekannt: nur diese erlauben. Sonst Wildcard als Fallback.
const frameSrc = authDomain ? `https://${authDomain}` : 'https://*.firebaseapp.com';

// CSP: Firebase / Google APIs whitelisted.
//
// HINWEIS: 'unsafe-inline' + 'unsafe-eval' bleiben drin, weil
//   - Firebase Auth + Next.js Hydration brauchen Inline-Scripts ohne Nonce
//   - Eine saubere Nonce-basierte CSP würde alle dynamischen Scripts
//     von Firebase/reCAPTCHA + Next.js-Bootstrap erfordern, die nicht
//     automatisch genonced werden in Next.js 16.
// www.google.com ist für Firebase reCAPTCHA Enterprise nötig.
//
// TODO(security): Auf nonce-/hash-basierte CSP migrieren, sobald Next.js 16's
//   neue 'proxy'-Konvention dokumentiert hat, wie Nonces auf ALLE Inline-Scripts
//   automatisch verteilt werden.
const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googleapis.com https://www.gstatic.com https://apis.google.com https://www.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://images.unsplash.com https://via.placeholder.com https://*.googleusercontent.com",
    // Hochgeladene Galerie-Videos liegen in Firebase Storage.
    "media-src 'self' blob: https://firebasestorage.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com https://www.google.com wss://*.firebaseio.com",
    `frame-src ${frameSrc} https://www.google.com https://maps.google.com`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    isProd ? 'upgrade-insecure-requests' : '',
].filter(Boolean).join('; ');

const securityHeaders = [
    { key: 'Content-Security-Policy', value: csp },
    // HSTS ohne 'preload' — preload sperrt die Domain dauerhaft auf HTTPS
    // und sollte erst nach Test + Anmeldung auf hstspreload.org gesetzt werden.
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig: NextConfig = {
    // firebase-admin (Node-only) nicht bundeln -> vermeidet ESM/CJS-Konflikte (jose).
    serverExternalPackages: ['firebase-admin'],
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'via.placeholder.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/v0/b/**' },
        ],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders,
            },
        ];
    },
};

export default nextConfig;
