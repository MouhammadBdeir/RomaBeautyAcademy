import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { getContactData } from "@/lib/contact/server";
import { guardMaintenance } from "@/lib/settings/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Impressum — RomaBeautyAcademy",
};

export default async function ImpressumPage() {
    await guardMaintenance();
    const c = await getContactData();
    const cityLine = [c.zip, c.city].filter(Boolean).join(" ");

    return (
        <LegalPage title="Impressum">
            <h2>Angaben gemäß § 5 TMG</h2>
            <p>
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
                {c.country && (
                    <>
                        <br />
                        {c.country}
                    </>
                )}
            </p>

            {c.managingDirector && (
                <>
                    <h2>Vertreten durch</h2>
                    <p>{c.managingDirector}</p>
                </>
            )}

            {(c.phone || c.email) && (
                <>
                    <h2>Kontakt</h2>
                    <p>
                        {c.phone && (
                            <>
                                Telefon: {c.phone}
                                <br />
                            </>
                        )}
                        {c.email && <>E-Mail: {c.email}</>}
                    </p>
                </>
            )}

            {(c.registerCourt || c.hrb) && (
                <>
                    <h2>Registereintrag</h2>
                    <p>
                        {c.registerCourt && (
                            <>
                                Registergericht: {c.registerCourt}
                                <br />
                            </>
                        )}
                        {c.hrb && <>Handelsregisternummer: {c.hrb}</>}
                    </p>
                </>
            )}

            {c.vatId && (
                <>
                    <h2>Umsatzsteuer-Identifikationsnummer</h2>
                    <p>{c.vatId}</p>
                </>
            )}

            <h2>Haftung für Inhalte</h2>
            <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
                allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
                verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
            </p>

            <h2>Haftung für Links</h2>
            <p>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.
            </p>

            <h2>Urheberrecht</h2>
            <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
                Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.
            </p>

            <h2>Streitschlichtung</h2>
            <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">
                    https://ec.europa.eu/consumers/odr/
                </a>
                . Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
            </p>
        </LegalPage>
    );
}
