import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { getContactData } from "@/lib/contact/server";
import { guardMaintenance } from "@/lib/settings/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Datenschutzerklärung — RomaBeautyAcademy",
};

export default async function DatenschutzPage() {
    await guardMaintenance();
    const c = await getContactData();
    const cityLine = [c.zip, c.city].filter(Boolean).join(" ");

    return (
        <LegalPage title="Datenschutzerklärung">
            <h2>1. Verantwortlicher</h2>
            <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
                <br />
                RomaBeautyAcademy
                {c.street && (
                    <>
                        <br />
                        {c.street}
                    </>
                )}
                {cityLine && (
                    <>
                        <br />
                        {cityLine}
                    </>
                )}
                {c.email && (
                    <>
                        <br />
                        E-Mail: {c.email}
                    </>
                )}
                {c.phone && (
                    <>
                        <br />
                        Telefon: {c.phone}
                    </>
                )}
            </p>

            <h2>2. Allgemeine Hinweise</h2>
            <p>
                Der Schutz deiner persönlichen Daten ist uns wichtig. Wir verarbeiten personenbezogene Daten im Einklang
                mit der Datenschutz-Grundverordnung (DSGVO) und dem Bundesdatenschutzgesetz (BDSG).
            </p>

            <h2>3. Hosting und Server-Logfiles</h2>
            <p>
                Beim Aufruf unserer Website werden automatisch Informationen (z. B. IP-Adresse, Datum und Uhrzeit des
                Zugriffs, aufgerufene Seite) in sogenannten Server-Logfiles erfasst. Rechtsgrundlage ist unser
                berechtigtes Interesse am sicheren und stabilen Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO).
            </p>

            <h2>4. Cookies</h2>
            <p>
                Wir verwenden technisch notwendige Cookies, z. B. für die Anmeldung im Admin-Bereich. Eingebettete
                Dienste (etwa Google Maps) können weitere Cookies setzen. Über den Cookie-Hinweis kannst du deine
                Auswahl treffen.
            </p>

            <h2>5. Terminbuchung und Kontaktanfragen</h2>
            <p>
                Wenn du über das Buchungsformular einen Termin anfragst, verarbeiten wir die von dir angegebenen Daten
                (Name, E-Mail, Telefon, gewählter Termin und ggf. Nachricht) zur Bearbeitung deiner Anfrage
                (Art. 6 Abs. 1 lit. b DSGVO). Die Daten werden bei unserem Auftragsverarbeiter Google (Firebase /
                Firestore) gespeichert und zusätzlich per E-Mail an uns übermittelt.
            </p>

            <h2>6. Firebase (Google)</h2>
            <p>
                Diese Website nutzt Dienste der Firebase-Plattform (Authentifizierung, Firestore-Datenbank, Storage) zur
                Bereitstellung von Anmeldung, Inhalten und Datenspeicherung. Anbieter ist die Google Ireland Limited,
                Gordon House, Barrow Street, Dublin 4, Irland.
            </p>

            <h2>7. Google Maps</h2>
            <p>
                Auf der Buchungsseite binden wir Kartenmaterial von Google Maps ein. Dabei kann deine IP-Adresse an
                Google übertragen werden. Anbieter ist die Google Ireland Limited.
            </p>

            <h2>8. Deine Rechte</h2>
            <p>
                Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
                Datenübertragbarkeit und Widerspruch. Zudem hast du das Recht, dich bei einer
                Datenschutz-Aufsichtsbehörde zu beschweren.
            </p>
        </LegalPage>
    );
}
