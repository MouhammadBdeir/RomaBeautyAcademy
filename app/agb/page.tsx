import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
    title: "AGB — RomaBeautyAcademy",
};

export default function AgbPage() {
    return (
        <LegalPage title="Allgemeine Geschäftsbedingungen">
            <h2>§ 1 Geltungsbereich</h2>
            <p>
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Behandlungen, Termine und Leistungen von
                RomaBeautyAcademy gegenüber Kundinnen und Kunden.
            </p>

            <h2>§ 2 Terminvereinbarung</h2>
            <p>
                Termine können online über das Buchungsformular angefragt werden. Eine Terminanfrage stellt noch keinen
                verbindlichen Vertrag dar; der Termin gilt erst nach unserer Bestätigung als vereinbart.
            </p>

            <h2>§ 3 Leistungen</h2>
            <p>
                Art und Umfang der Behandlung ergeben sich aus der jeweiligen Beschreibung bzw. der individuellen
                Absprache vor Ort. Wir behandeln nach bestem Wissen und fachlichem Standard.
            </p>

            <h2>§ 4 Preise und Zahlung</h2>
            <p>
                Es gelten die zum Zeitpunkt der Behandlung ausgewiesenen Preise inkl. gesetzlicher Umsatzsteuer. Die
                Zahlung ist, sofern nicht anders vereinbart, unmittelbar nach der Behandlung fällig.
            </p>

            <h2>§ 5 Stornierung und Terminabsage</h2>
            <p>
                Vereinbarte Termine bitten wir, mindestens 24 Stunden vorher abzusagen oder zu verschieben. Bei nicht
                rechtzeitig abgesagten Terminen behalten wir uns vor, ein angemessenes Ausfallhonorar zu berechnen.
            </p>

            <h2>§ 6 Haftung</h2>
            <p>
                Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des
                Lebens, des Körpers oder der Gesundheit. Im Übrigen ist die Haftung auf den vertragstypischen,
                vorhersehbaren Schaden begrenzt.
            </p>

            <h2>§ 7 Schlussbestimmungen</h2>
            <p>
                Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen unwirksam sein, bleibt
                die Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>
        </LegalPage>
    );
}
