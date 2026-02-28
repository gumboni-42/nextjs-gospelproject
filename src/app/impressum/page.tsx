import ObfuscatedEmail from "@/components/ObfuscatedEmail";

export const metadata = {
    title: "Impressum | Gospelproject",
    description: "Impressum des Gospelproject",
};

export default function ImpressumPage() {
    return (
        <main className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Impressum</h1>
                <div className="prose max-w-none">
                    <h2>Verantwortlich</h2>
                    <p>
                        <strong>Gospelverein</strong>
                        Postfach<br />
                        8608 Bubikon<br />
                        Schweiz
                    </p>

                    <p>
                        <ObfuscatedEmail />
                    </p>
                    <h3>Vertreten durch</h3>
                    <p>
                        Max Erich Gyr, Präsident<br />
                        Christina Gasser-Zürcher
                    </p>

                    <h2>Haftungsausschluss</h2>

                    <p>
                        Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen auf dieser Webseite.
                        Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der Verbindung oder durch technische Störungen entstanden sind, werden ausgeschlossen.
                    </p>
                    <p>
                        Alle Angebote sind unverbindlich. Der Autor behält es sich ausdrücklich vor, Teile der Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.
                    </p>

                    <h2>Haftung für Links</h2>

                    <p>
                        Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres Verantwortungsbereichs Es wird jegliche Verantwortung für solche Webseiten abgelehnt. Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr des Nutzers oder der Nutzerin.
                    </p>

                    <h2>Urheberrechte</h2>

                    <p>
                        Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf der Website gehören ausschliesslich der Firma oder den speziell genannten Rechtsinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen.
                    </p>

                    <h2>Datenschutz</h2>

                    <p>Gestützt auf Artikel 13 der schweizerischen Bundesverfassung und die datenschutzrechtlichen Bestimmungen des Bundes (Datenschutzgesetz, DSG) hat jede Person Anspruch auf Schutz ihrer Privatsphäre sowie auf Schutz vor Missbrauch ihrer persönlichen Daten. Wir halten diese Bestimmungen ein. Nutzerdaten werden streng vertraulich behandelt und ohne Zustimmung des Kunden nicht an Dritte weitergegeben. Im Übrigen gelten die Bestimmungen unserer AGB.</p>

                    <p> Beim Zugriff auf unsere Webseiten werden folgende Daten in Logfiles gespeichert: IP-Adresse, Datum, Uhrzeit, Browser-Anfrage und allg. übertragene Informationen zum Betriebssystem resp. Browser. Diese Nutzungsdaten bilden die Basis für statistische, anonyme Auswertungen, so dass Trends erkennbar sind, anhand derer wir unsere Angebote entsprechend verbessern können.</p>
                </div>
            </div>
        </main>
    );
}
