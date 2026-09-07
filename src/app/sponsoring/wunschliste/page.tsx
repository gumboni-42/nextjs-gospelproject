import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "@/components/CustomPortableText";
import { SponsoringWishlistForm, type WishlistCategory } from "@/components/SponsoringWishlistForm";

const WUNSCHLISTE_QUERY = `*[_type == "sponsoringWunschliste"][0]{
  title,
  subtitle,
  introText,
  successTitle,
  successText,
  "categories": categories[]{
    _key,
    title,
    description,
    emoji,
    "items": items[]{
      _key,
      title,
      description,
      unitAmount,
      totalUnits,
      "claimedUnits": coalesce(claimedUnits, 0),
      isAvailable
    }
  }
}`;

export const metadata = {
    title: "Wunschliste – Sponsoring",
    description:
        "Wähle aus, welchen Teil des Gospelprojects du als Sponsor finanzieren möchtest – von der Eventtechnik bis zu einzelnen Songs.",
};

export default async function WunschlitePage() {
    const data = await sanityFetch<SanityDocument>({
        query: WUNSCHLISTE_QUERY,
        tags: ["sponsoringWunschliste"],
    });

    // Fallback content if Sanity document hasn't been created yet
    const categories: WishlistCategory[] = (data?.categories ?? FALLBACK_CATEGORIES);
    const title = data?.title ?? "Wunschliste";
    const subtitle = data?.subtitle ?? "Unterstütze uns gezielt – wähle aus, was du finanzieren möchtest.";

    return (
        <main className="min-h-screen">
            {/* Hero / Header */}
            <div className="pt-32 pb-4 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3"
                        style={{ color: "var(--gospel-primary)" }}>
                        Sponsoring
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">{title}</h1>
                    <p className="text-lg leading-relaxed max-w-xl mx-auto"
                        style={{ color: "var(--text-muted)" }}>
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Intro text from Sanity */}
            {data?.introText && (
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="prose max-w-none">
                        <PortableText value={data.introText} />
                    </div>
                </div>
            )}

            {/* Wishlist */}
            <div className="max-w-3xl mx-auto px-4 py-10">
                <SponsoringWishlistForm
                    categories={categories}
                    successTitle={data?.successTitle}
                    successText={data?.successText}
                />
            </div>
        </main>
    );
}

// ── Fallback data (used until Sanity document is populated) ──────────────────
// Based on the 2026 Gospelproject wishlist CSV
const FALLBACK_CATEGORIES: WishlistCategory[] = [
    {
        _key: "cat-memories",
        title: "Gospel Memories",
        description: "Unsere Gospel Erlebnisse festhalten hat einen bleibenden Wert.",
        emoji: "📸",
        items: [
            {
                _key: "item-fotograf",
                title: "Fotograf",
                description: "Der Fotograf schenkt uns bildhübsche Gospel Erinnerungen (1 Hauptprobe + 5 Konzerte).",
                unitAmount: "200.-",
                totalUnits: 5,
                claimedUnits: 0,
                isAvailable: true,
            },
            {
                _key: "item-video",
                title: "Video Produktion",
                description: "Konzertmomente mit Bild und Ton mehrmals erleben zu können – für uns und Online-Besucher.",
                unitAmount: "300.-",
                totalUnits: 10,
                claimedUnits: 0,
                isAvailable: true,
            },
        ],
    },
    {
        _key: "cat-sound",
        title: 'Eventtechnik "Sound & Light"',
        description: "Die Bühnentechniker geben alles für eine gute Klangmischung und die passenden Lichteffekte.",
        emoji: "🎤",
        items: [
            {
                _key: "item-eventtechnik",
                title: "Eventtechnik – Beleuchtung, Mikrofone & Lautsprecher",
                description: "Mikrofone, Lautsprecher, Scheinwerfer – die Eventtechnik unterstützt unser Gospel sehr (1 Hauptprobe + 5 Konzerte).",
                unitAmount: "100.-",
                totalUnits: 70,
                claimedUnits: 0,
                isAvailable: true,
            },
            {
                _key: "item-verpflegung",
                title: "Verpflegung Stage Crew",
                description: "Bei einem ganzen Tag Arbeit braucht es vor dem Konzert eine Stärkung.",
                unitAmount: "100.-",
                totalUnits: 12,
                claimedUnits: 0,
                isAvailable: true,
            },
            {
                _key: "item-soundprobe",
                title: "Soundtechnik für Proben",
                description: "In den Proben brauchen unsere Solostimmen Verstärkung. 2 neue Solomikrofone haben einen langfristigen Wert.",
                unitAmount: "50.-",
                totalUnits: 12,
                claimedUnits: 0,
                isAvailable: true,
            },
        ],
    },
    {
        _key: "cat-personal",
        title: "Gospel Personal",
        description: "",
        emoji: "🎶",
        items: [
            {
                _key: "item-instrumente",
                title: "Spezielle Instrumente",
                description: "2–3 extra Instrumente ergänzen die Basisbesetzung und bringen zusätzliche Klangfarbe rein.",
                unitAmount: "100.-",
                totalUnits: 75,
                claimedUnits: 0,
                isAvailable: true,
            },
            {
                _key: "item-dankesgeschenke",
                title: "Dankesgeschenke (Musiker, Solisten, Stage Crew, Projektteam)",
                description: "Mega dankbar für den Zusammenklang – das unterstreichen wir gerne auch mit einem kleinen Geschenk.",
                unitAmount: "20.-",
                totalUnits: 25,
                claimedUnits: 0,
                isAvailable: true,
            },
            {
                _key: "item-blumen",
                title: "Blumen für die Dirigentin",
                description: "Mit einem Blumengruss unterstreichen wir nach jedem Konzert unsere Dankbarkeit.",
                unitAmount: "50.-",
                totalUnits: 5,
                claimedUnits: 0,
                isAvailable: true,
            },
        ],
    },
    {
        _key: "cat-songs",
        title: "Gospel Songs",
        description: "Möchtest du einen unserer Konzertsongs oder das gesamte Songmaterial spendieren?",
        emoji: "🎵",
        items: [
            {
                _key: "item-songmaterial",
                title: "Songmaterial (Arrangements, Noten, Rechte, Demos)",
                description: "Um einen Song zum Klingen zu bringen, braucht es einiges an Arbeit und Material – 16 Songs insgesamt.",
                unitAmount: "100.-",
                totalUnits: 80,
                claimedUnits: 0,
                isAvailable: true,
            },
            {
                _key: "item-song-1",
                title: "Einzelner Song (1 von 16)",
                description: "Möchtest du einen unserer Konzertsongs spendieren?",
                unitAmount: "500.-",
                totalUnits: 1,
                claimedUnits: 0,
                isAvailable: true,
            },
        ],
    },
    {
        _key: "cat-gemeinschaft",
        title: "Gospel Gemeinschaft",
        description: "",
        emoji: "🤝",
        items: [
            {
                _key: "item-adventsessen",
                title: "Adventsessen als Projektabschluss",
                description: "Ein gemeinsamer Abend als krönender Abschluss des Gospelprojects.",
                unitAmount: "50.-",
                totalUnits: 14,
                claimedUnits: 0,
                isAvailable: true,
            },
            {
                _key: "item-dankesessen",
                title: "Dankesessen Personal",
                description: "Ein Dankeschön-Abendessen für alle, die hinter den Kulissen gearbeitet haben.",
                unitAmount: "50.-",
                totalUnits: 10,
                claimedUnits: 0,
                isAvailable: true,
            },
            {
                _key: "item-zvieri",
                title: "Zvieri beim Probetag",
                description: "Eine kleine Stärkung für den Chor an langen Probetagen.",
                unitAmount: "50.-",
                totalUnits: 6,
                claimedUnits: 0,
                isAvailable: true,
            },
        ],
    },
];
