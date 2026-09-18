import { PortableText, type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { HeroSection } from "@/components/HeroSection";
import { PageLogo } from "@/components/PageLogo";
import { ZvvWidget } from "@/components/ZvvWidget";
import Image from "next/image";

interface AgendaItem extends SanityDocument {
    _id: string;
    date: string;
    doorsOpenTime?: string;
    title: string;
    subtitle?: string;
    placeName: string;
    placeAddress?: string;
    placeUrl?: string;
    transportInfo?: string;
    zvvCode?: string;
    zvvUrl?: string;
    ticketInfo?: string;
    ticketUrl?: string;
    ticketButtonText?: string;
    ticketStatus?: 'not_yet' | 'on_sale' | 'sold_out';
    ticketNotYetText?: string;
    ticketSoldOutText?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    description?: any;
    active: boolean;
    logoType?: 'none' | 'gospelation' | 'gospelproject';
}

const AGENDA_QUERY = `{
    "items": *[
      _type == "agenda"
      && active == true
      && date >= now()
    ]|order(date asc){
      _id,
      date,
      doorsOpenTime,
      title,
      subtitle,
      placeName,
      placeAddress,
      placeUrl,
      transportInfo,
      zvvCode,
      zvvUrl,
      ticketInfo,
      ticketUrl,
      ticketButtonText,
      ticketStatus,
      ticketNotYetText,
      ticketSoldOutText,
      description,
      logoType
    },
    "page": *[_type == "agendaPage"][0]
}`;

export const metadata = {
    title: "Agenda",
    description: "Alle kommenden Konzerte und Events des Gospelproject auf einen Blick. Finde heraus, wann und wo wir auftreten.",
};

export default async function AgendaPage() {
    const data = await sanityFetch<{ items: AgendaItem[], page: SanityDocument }>({ query: AGENDA_QUERY, tags: ['agenda', 'agendaPage'] });
    const { items: agendaItems, page } = data;

    return (
        <main className="min-h-screen pb-16">
            <HeroSection
                title={page?.title || "Upcoming Gigs"}
                image={page?.heroImage}
            />

            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <PageLogo logo={page?.logo} title={page?.title} show={page?.showLogo} />
                {agendaItems.length === 0 ? (
                    <div className="text-center text-(--text-secondary) py-12">
                        <p className="text-xl">No upcoming events at the moment.</p>
                        <p>Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {agendaItems.map((item: AgendaItem) => {
                            const date = new Date(item.date);
                            const day = date.toLocaleDateString('de-CH', { day: 'numeric', timeZone: 'Europe/Zurich' });
                            const month = date.toLocaleDateString('de-CH', { month: 'short', timeZone: 'Europe/Zurich' }).toUpperCase().replace('.', '');
                            const weekdayShort = date.toLocaleDateString('de-CH', { weekday: 'short', timeZone: 'Europe/Zurich' });
                            const weekdayLong = date.toLocaleDateString('de-CH', { weekday: 'long', timeZone: 'Europe/Zurich' });
                            const year = date.toLocaleDateString('de-CH', { year: 'numeric', timeZone: 'Europe/Zurich' });
                            const monthLong = date.toLocaleDateString('de-CH', { month: 'long', timeZone: 'Europe/Zurich' });
                            const time = date.toLocaleTimeString('de-CH', {
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'Europe/Zurich',
                            });

                            const doorsOpenFormatted = item.doorsOpenTime?.trim();
                            const doorsOpenString = doorsOpenFormatted
                                ? ` (Türöffnung ${doorsOpenFormatted.toLowerCase().endsWith('uhr') ? doorsOpenFormatted : `${doorsOpenFormatted} Uhr`})`
                                : '';

                            const mapsUrl = item.placeUrl || (item.placeName || item.placeAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([item.placeName, item.placeAddress].filter(Boolean).join(', '))}` : undefined);

                            return (
                                <div
                                    key={item._id}
                                    className="agenda-card group relative overflow-hidden rounded-2xl p-5 sm:p-6 shadow-lg ring-1 transition-all hover:shadow-xl"
                                >
                                    {/* Optional Logo */}
                                    {item.logoType && item.logoType !== 'none' && (
                                        <div className="absolute top-4 right-4 z-10 hidden sm:block">
                                            <Image
                                                src={`/${item.logoType}-logo.png`}
                                                alt={`${item.logoType} logo`}
                                                width={150}
                                                height={50}
                                                className="object-contain opacity-80"
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6 relative z-20">
                                        {/* === MOBILE: top header row (leaf + title) === */}
                                        <div className="flex flex-row items-start gap-3 sm:contents">
                                            {/* Calendar Leaf */}
                                            <div className="shrink-0">
                                                <div
                                                    className="w-16 sm:w-28 rounded-2xl overflow-hidden shadow-md ring-1 ring-black/10 bg-white transition-transform duration-300 group-hover:scale-105 select-none"
                                                >
                                                    {/* Header band */}
                                                    <div
                                                        className="py-1.5 px-2 text-center text-xs sm:text-sm font-bold uppercase tracking-wider text-white"
                                                        style={{ backgroundColor: 'var(--gospel-primary)' }}
                                                    >
                                                        {month}
                                                    </div>
                                                    {/* Day number & weekday */}
                                                    <div className="py-2 sm:py-3 px-2 text-center flex flex-col items-center justify-center bg-white">
                                                        <span
                                                            className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-neutral-900"
                                                        >
                                                            {day}
                                                        </span>
                                                        <span
                                                            className="text-xs sm:text-sm font-bold uppercase tracking-wider mt-1 sm:mt-1.5 text-neutral-600"
                                                        >
                                                            {weekdayShort}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mobile-only: subtitle + title next to the leaf */}
                                            <div className="flex-1 min-w-0 sm:hidden pt-0.5">
                                                {item.subtitle && (
                                                    <div
                                                        className="text-xs font-semibold tracking-wide uppercase mb-0.5"
                                                        style={{ color: 'var(--gospel-primary)' }}
                                                    >
                                                        {item.subtitle}
                                                    </div>
                                                )}
                                                <h2
                                                    className="text-lg font-bold leading-tight"
                                                    style={{ color: 'var(--foreground)' }}
                                                >
                                                    {item.title}
                                                </h2>
                                            </div>
                                        </div>

                                        {/* Content — on desktop this is the single flex column next to the leaf */}
                                        <div className="flex-1 min-w-0 mt-3 sm:mt-0">
                                            {/* Desktop-only: subtitle + title (hidden on mobile, shown above) */}
                                            {item.subtitle && (
                                                <div
                                                    className="hidden sm:block text-xs sm:text-sm font-semibold tracking-wide uppercase mb-1 pr-0 sm:pr-28"
                                                    style={{ color: 'var(--gospel-primary)' }}
                                                >
                                                    {item.subtitle}
                                                </div>
                                            )}

                                            {/* Title — desktop only */}
                                            <h2
                                                className="hidden sm:block text-xl sm:text-2xl font-bold mb-1.5 pr-0 sm:pr-28 leading-snug"
                                                style={{ color: 'var(--foreground)' }}
                                            >
                                                {item.title}
                                            </h2>

                                            {/* Time & full date meta row */}
                                            <div
                                                className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-medium mb-2.5"
                                                style={{ color: 'var(--gospel-primary)' }}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-80 shrink-0">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                                                    </svg>
                                                    {time} Uhr{doorsOpenString}
                                                </span>
                                                <span className="text-(--text-muted)">•</span>
                                                <span style={{ color: 'var(--text-secondary)' }}>
                                                    {weekdayLong}, {day}. {monthLong} {year}
                                                </span>
                                            </div>

                                            {/* Location & Address */}
                                            {(item.placeName || item.placeAddress) && (
                                                <div className="mb-3">
                                                    <a
                                                        href={mapsUrl || '#'}
                                                        target={mapsUrl ? '_blank' : undefined}
                                                        rel={mapsUrl ? 'noopener noreferrer' : undefined}
                                                        className="inline-flex items-start gap-1.5 text-sm transition-colors hover:text-[color:var(--gospel-primary)] group/loc"
                                                        style={{ color: 'var(--text-secondary)' }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-70 shrink-0 mt-0.5 group-hover/loc:text-[color:var(--gospel-primary)]">
                                                            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.62.829.799 1.654 1.381 2.274 1.766.311.192.571.337.757.433.093.048.17.088.232.117.029.014.05.024.066.032l.009.004.003.002zM10 13a4 4 0 100-8 4 4 0 000 8z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>
                                                            <span className="font-medium text-[color:var(--foreground)]">{item.placeName}</span>
                                                            {item.placeAddress && (
                                                                <span className="text-(--text-secondary) block sm:inline sm:ml-1.5">
                                                                    {item.placeName ? `· ${item.placeAddress}` : item.placeAddress}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </a>
                                                </div>
                                            )}

                                            {/* Parking / Transit Info & ZVV Link / Widget */}
                                            {(item.transportInfo || item.zvvCode || item.zvvUrl) && (
                                                <ZvvWidget
                                                    code={item.zvvCode || item.zvvUrl}
                                                    eventDate={item.date}
                                                    destinationName={item.placeAddress || item.placeName}
                                                    transportInfo={item.transportInfo}
                                                />
                                            )}

                                            {/* Tickets / Kollekte Action Row */}
                                            {(item.ticketStatus || item.ticketInfo || item.ticketUrl) && (
                                                <div className="mb-3.5 flex flex-wrap items-center gap-2.5 pt-0.5">
                                                    {/* Status: Tickets not yet on sale */}
                                                    {item.ticketStatus === 'not_yet' && (
                                                        <span
                                                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-80">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>{item.ticketNotYetText || "Tickets demnächst erhältlich"}</span>
                                                        </span>
                                                    )}

                                                    {/* Status: On sale – show buy button */}
                                                    {item.ticketStatus === 'on_sale' && item.ticketUrl && (
                                                        <a
                                                            href={item.ticketUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
                                                            style={{ backgroundColor: 'var(--gospel-primary)' }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                                <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v2.5a1.5 1.5 0 000 3V14a1 1 0 01-1 1H2a1 1 0 01-1-1v-3.5a1.5 1.5 0 000-3V4zm3 3a1 1 0 00-1 1v4a1 1 0 001 1h12a1 1 0 001-1V8a1 1 0 00-1-1H4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>{item.ticketButtonText || "Tickets kaufen"}</span>
                                                        </a>
                                                    )}

                                                    {/* Status: Sold out */}
                                                    {item.ticketStatus === 'sold_out' && (
                                                        <span
                                                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-80">
                                                                <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v2.5a1.5 1.5 0 000 3V14a1 1 0 01-1 1H2a1 1 0 01-1-1v-3.5a1.5 1.5 0 000-3V4zm3 3a1 1 0 00-1 1v4a1 1 0 001 1h12a1 1 0 001-1V8a1 1 0 00-1-1H4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>{item.ticketSoldOutText || "Ausverkauft"}</span>
                                                        </span>
                                                    )}

                                                    {/* Free-text info (e.g. «Freier Eintritt mit Kollekte») */}
                                                    {item.ticketInfo && (
                                                        <span
                                                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5"
                                                            style={{ color: 'var(--text-secondary)' }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-70">
                                                                <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v2.5a1.5 1.5 0 000 3V14a1 1 0 01-1 1H2a1 1 0 01-1-1v-3.5a1.5 1.5 0 000-3V4zm3 3a1 1 0 00-1 1v4a1 1 0 001 1h12a1 1 0 001-1V8a1 1 0 00-1-1H4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>{item.ticketInfo}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Description */}
                                            {item.description && (
                                                <div className="mt-3 prose prose-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    <PortableText value={item.description} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
