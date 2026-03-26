import { NextResponse } from 'next/server'

const SITE_URL = 'https://www.gospelproject.ch'

const LLMS_TXT = `# Gospelproject

> Gospelproject ist ein Gospelchor und Verein aus Bubikon (Schweiz), der Gospelmusik lebt und fördert.

## Über uns

- **Organisation**: Gospelverein
- **Standort**: Bubikon, 8608, Schweiz
- **Kontakt**: info@gospelproject.ch
- **Website**: ${SITE_URL}

Gospelproject vereint Sängerinnen und Sänger aller Altersgruppen, die gemeinsam Gospelmusik erleben. Das Projekt umfasst regelmässige Proben, Konzerte und Events in der Deutschschweiz.

## Bereiche

### Gospelproject
Der Gospelchor — Gospel all year long. Mitmachen, Proben, Konzerte und Gemeinschaft.
- [Übersicht](${SITE_URL}/gospelproject)
- [Mitmachen](${SITE_URL}/gospelproject/mitmachen)
- [Anmeldung](${SITE_URL}/gospelproject/anmeldung)
- [Termine](${SITE_URL}/gospelproject/termine)
- [Team](${SITE_URL}/gospelproject/team)
- [Teilnahmebedingungen](${SITE_URL}/gospelproject/teilnahmebedingungen)

### Gospelation
Gospelation-Events und Mitmach-Möglichkeiten.
- [Übersicht](${SITE_URL}/gospelation)
- [Engagieren](${SITE_URL}/gospelation/engagieren)

### Gospelverein
Der Verein hinter Gospelproject — Mitgliedschaft, Gönner werden und Spenden.
- [Gospelverein](${SITE_URL}/gospelverein)

## Weitere Seiten

- [Agenda](${SITE_URL}/agenda): Kommende Konzerte und Events
- [Sponsoring](${SITE_URL}/sponsoring): Sponsoring-Möglichkeiten
- [Zusammenklang](${SITE_URL}/zusammenklang): Sponsoring und Spenden
- [Newsletter](${SITE_URL}/newsletter): Newsletter-Anmeldung
- [Impressionen](${SITE_URL}/impressionen): Fotogalerie
- [Kontakt](${SITE_URL}/kontakt): Kontaktformular

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
