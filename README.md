# RomaBeautyAcademy

Website eines Beauty-Studios mit integriertem **Admin-CMS** – Inhalte, Bilder, Galerie,
Buchungen und Kontaktdaten lassen sich ohne Code pflegen.

Tech-Stack: **Next.js 16** (App Router), **React 19**, **Tailwind CSS v4**, **Firebase**
(Authentication, Firestore, Storage), **framer-motion**.

---

## Features

**Öffentlich**
- Startseite (Hero, Services, Galerie, Über uns, Bewertungen, Buchung) – Sektionen einzeln ein-/ausblendbar
- Galerie mit Fotos **und** Videos
- Terminbuchung mit Kalender: Mo–Sa buchbar, Sonntage und **deutsche Feiertage** gesperrt
  (Feiertage via [Nager.Date](https://date.nager.at)), Telefon-Pflicht, Datenschutz-Zustimmung
- Impressum, AGB, Datenschutz (aus den Kontaktdaten generiert) + Cookie-Hinweis

**Admin** (`/admin`)
- Login & Registrierung mit **Owner-Freigabe** (Custom Claims, httpOnly-Session-Cookies)
- Benutzerverwaltung: freigeben, ablehnen, Rechte entziehen, löschen, Passwort zurücksetzen
- **Medien-Workspace**: Mini-Homepage, pro Sektion Bilder ändern (mit empfohlener Auflösung &
  Live-Vorschau), Galerie-Verwaltung
- Buchungsverwaltung: Kalender + Tabelle, bestätigen/absagen/verschieben, Filter (heute/morgen/Datum)
- Kontaktdaten: E-Mail, Telefon, Adresse, Geschäftsführer, Registergericht, HRB, USt-IdNr.,
  beliebig viele Social-Links
- Speicher-Nutzung & Kostenschätzung (Firebase Storage)

---

## Schnellstart

```bash
npm install
# .env.local anlegen (siehe unten)
npm run dev          # http://localhost:3000
npm run seed:admin   # legt den Owner-Admin an
```

## Umgebungsvariablen (`.env.local`)

```
NEXT_PUBLIC_SITE_URL=

# Firebase Web-SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin-SDK (Service-Account)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

ADMIN_OWNER_EMAIL=       # Owner-Konto (auto-Admin)
SEED_ADMIN_PASSWORD=     # Passwort für `npm run seed:admin`
HOLIDAY_STATE=           # optional, z. B. DE-NW für landesspezifische Feiertage

# SMTP (optional, für Benachrichtigungen)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

> `.env.local` ist in `.gitignore` und wird **nicht** eingecheckt.

## Skripte

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver |
| `npm run build` / `npm start` | Produktions-Build / -Start |
| `npm run lint` | ESLint |
| `npm run seed:admin` | Owner-Admin anlegen/aktualisieren |
| `npm run deploy:rules` | Firestore-/Storage-Rules deployen (Service-Account braucht „Firebase Rules Admin") |

## Firebase einrichten

1. In der Firebase Console **Authentication → Email/Password** aktivieren.
2. **Firestore** und **Storage** aktivieren.
3. `npm run seed:admin` ausführen und unter `/admin/login` einloggen.

> **Hinweis:** Bild-/Video-Uploads laufen serverseitig über das Admin-SDK und die öffentliche
> Anzeige über Polling (`/api/site-state`) – dafür sind **keine** Firestore-/Storage-Rules nötig.
> Die mitgelieferten `firestore.rules` / `storage.rules` sind für ein optionales Hardening gedacht.

## Architektur (Kurz)

- **Auth:** Firebase Client-SDK (Login) → Session-Cookie via Admin-SDK; Schutz über `proxy.ts`
  (optimistisch) + serverseitiges `requireAdmin()`.
- **Inhalte:** Firestore-Dokumente unter `config/*` (`siteImages`, `sections`, `contactData`)
  sowie Collections `gallery` und `bookings`. Schreiben ausschließlich über Admin-Routen.
- **Echtzeit:** Client pollt `/api/site-state` (Admin-SDK) – rule-frei.
- **Uploads:** `/api/admin/upload` (Admin-SDK + Download-Token) → öffentlich lesbar ohne Rules.

> Die Rechtstexte (Impressum/AGB/Datenschutz) sind **Vorlagen** und sollten vor dem
> Live-Gang rechtlich geprüft werden.
