import { NextResponse } from 'next/server'

const SITE_URL = 'https://www.gospelproject.ch'

const LLMS_TXT = `# Gospelproject

> Gospelproject ist einer der grössten Gospelchöre der Schweiz — ein Gemeinschaftsprojekt aus Rüti ZH, das Sängerinnen und Sänger aller Altersgruppen zusammenbringt, um gemeinsam Gospelmusik zu erleben und aufzuführen.

## Über uns

- **Organisation**: Gospelverein (gegründet 2006, Sitz in Rüti ZH)
- **Chor gegründet**: 1999 von Christina Gasser, unterstützt von der Reformierten Kirche Rüti
- **Standort**: Rüti ZH, Schweiz
- **Kontakt**: info@gospelproject.ch
- **Website**: ${SITE_URL}
- **Social Media**: Instagram, YouTube, Spotify, Apple Music, Facebook

Gospelproject vereint über 130 Sängerinnen und Sänger, die gemeinsam mit Solistinnen, Solisten und Musikerinnen und Musikern auftreten. Der Stil reicht von langsamen, berührenden Stücken bis zu mitreissenden Funky-Rhythmen — traditionelle und zeitgenössische Gospelmusik. Das Projekt umfasst regelmässige Proben, Konzerte und Events in der Deutschschweiz.

## Bereiche

### Gospelproject — der Projektchor
Der saisonale Mitmach-Chor: Jede Produktion beginnt mit einem Kickoff, gefolgt von wöchentlichen Proben (montags in Rüti ZH) und endet mit mehreren öffentlichen Konzerten. Keine musikalische Vorbildung nötig — willkommen ist, wer Freude an Gospelmusik hat.

Ablauf einer Produktion:
1. Kickoff nach der Sommerpause: Noten, Liedtexte und Demo-Aufnahmen werden ausgeteilt
2. Selbststudium: Lieder eigenständig einüben
3. Wöchentliche Gruppenproben montags in Rüti ZH
4. Fünf öffentliche Konzerte am Schluss der Produktion

Anmeldeschluss Produktion 2026: 31. Juli 2026.

- [Übersicht](${SITE_URL}/gospelproject): Was ist Gospelproject?
- [Mitmachen](${SITE_URL}/gospelproject/mitmachen): Aktueller Projektstatus und Infos zur Teilnahme
- [Anmeldung](${SITE_URL}/gospelproject/anmeldung): Anmeldeformular für die aktuelle Produktion
- [Termine](${SITE_URL}/gospelproject/termine): Proben- und Konzertdaten mit PDF-Download
- [Team](${SITE_URL}/gospelproject/team): Teamvorstellung — Chorleitung, Solistinnen/Solisten, Band
- [Teilnahmebedingungen](${SITE_URL}/gospelproject/teilnahmebedingungen): Verbindliche Teilnahmebedingungen
- [Mitgliederbereich](${SITE_URL}/gospelproject/member): Passwortgeschützter Bereich für aktive Chormitglieder

### Gospelation — das Stammensemble
"Gospel all year long." 
Gospelation ist der permanente Gospelchor, der das ganze Jahr über auftritt. Mit fast 20 Jahren Auftrittserfahrung tritt das Ensemble an grossen Konzertbühnen ebenso auf wie an kleinen privaten Anlässen. Geleitet von Christina Gasser, mit denselben Musikerinnen, Musikern und Solistinnen/Solisten wie Gospelproject.

Gospelation ist buchbar für: Hochzeiten, Firmenfeiern, Jazzfestivals, Gemeindeanlässe, Weihnachtsfeiern, Gottesdienste und weitere private oder öffentliche Veranstaltungen. Besetzung, Chorgrösse und technisches Equipment werden flexibel auf den jeweiligen Anlass abgestimmt.

- [Übersicht](${SITE_URL}/gospelation): Was ist Gospelation?
- [Engagieren](${SITE_URL}/gospelation/engagieren): Gospelation buchen — Anfrage stellen

### Gospelverein — der Verein
Der Gospelverein (gegründet 2006) bildet die rechtliche und finanzielle Trägerstruktur für Gospelproject und Gospelation. Politisch und konfessionell neutral, mit enger Verbindung zur Reformierten Landeskirche. Ca. 100 Mitglieder in drei Kategorien:

- **Aktivmitglieder**: Aktuelle oder ehemalige Chorteilnehmende mit Stimmrecht
- **Ehrenmitglieder**: Vom Vorstand ernannte Personen mit besonderem Verdienst
- **Gönnerinnen/Gönner**: Familienmitglieder, Freunde, ehemalige Teilnehmende — finanzielle Unterstützung ab CHF 50/Jahr

- [Gospelverein](${SITE_URL}/gospelverein): Vereinsinfo, Statuten, Organigramm, Gönner werden

## Konzerte & Agenda

Kommende Konzerte 2026:
- 5. Juli 2026, 16:00 Uhr — Abendgottesdienst mit Gospel, Ref. Kirche Rüti ZH (Gospelation)
- 13. November 2026, 19:00 Uhr — Gospelproject Konzert, Ref. Kirche Rüti ZH
- 14. November 2026, 19:00 Uhr — Gospelproject Konzert, Ref. Kirche Rüti ZH
- 20. November 2026, 19:00 Uhr — Gospelproject Konzert, HesliHalle Küsnacht ZH
- 28. November 2026, 19:00 Uhr — Gospelproject Konzert, Stadthofsaal Uster ZH
- 29. November 2026, 16:00 Uhr — Gospelproject Konzert, Stadthofsaal Uster ZH

- [Agenda](${SITE_URL}/agenda): Vollständige Konzert- und Eventübersicht

## Weitere Seiten

- [Impressionen](${SITE_URL}/impressionen): Fotogalerie und YouTube-Videos aus vergangenen Konzerten
- [Sponsoring](${SITE_URL}/sponsoring): Sponsoring-Möglichkeiten für die Produktion 2026 (aktuelle Sponsoren: Zürcher Kantonalbank, Crealine Media Systems; Medienpartner: Radio Zürisee)
- [Zusammenklang](${SITE_URL}/zusammenklang): Detailliertes Sponsoring-Konzept, Spendenmöglichkeiten (Bankverbindung ZKB, TWINT)
- [Newsletter](${SITE_URL}/newsletter): Newsletter abonnieren — aktuelle Infos zu Konzerten und Anmeldung
- [Kontakt](${SITE_URL}/kontakt): Kontaktformular für allgemeine Anfragen und Buchungen

## Rechtliches

- [Impressum](${SITE_URL}/impressum)
- [Datenschutz](${SITE_URL}/datenschutz)
`

export async function GET() {
    return new NextResponse(LLMS_TXT, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    })
}
