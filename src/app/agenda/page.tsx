import { PortableText, type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { HeroSection } from "@/components/HeroSection";
import Image from "next/image";

interface AgendaItem extends SanityDocument {
    _id: string;
    date: string;
    title: string;
    placeName: string;
    placeUrl: string;
    description?: any;
    active: boolean;
    logoType?: 'none' | 'gospelation' | 'gospelproject';
}

const AGENDA_QUERY = `{
    "items": *[
      _type == "agenda"
      && active == true
      && date >= now()
    ]|order(date asc){_id, date, title, placeName, placeUrl, description, logoType},
    "page": *[_type == "agendaPage"][0]
}`;

const options = { next: { revalidate: 60 } };

export const metadata = {
    title: "Agenda - Gospel Project",
    description: "Upcoming gigs and events.",
};

export default async function AgendaPage() {
    const data = await client.fetch<{ items: AgendaItem[], page: any }>(AGENDA_QUERY, {}, options);
    const { items: agendaItems, page } = data;

    return (
        <main className="min-h-screen pb-16">
            <HeroSection
                title={page?.title || "Upcoming Gigs"}
                image={page?.heroImage}
                logo={page?.logo}
            />

            <div className="container mx-auto px-4 py-16 max-w-4xl">
                {agendaItems.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        <p className="text-xl">No upcoming events at the moment.</p>
                        <p>Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {agendaItems.map((item) => {
                            const date = new Date(item.date);
                            const formattedDate = date.toLocaleDateString('de-CH', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            });
                            const time = date.toLocaleTimeString('de-CH', {
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <div
                                    key={item._id}
                                    className="group relative overflow-hidden rounded-2xl bg-white/5 p-6 shadow-lg ring-1 ring-gray-900/5 transition-all hover:shadow-xl dark:bg-white/5 hover:bg-white/10 dark:ring-white/10"
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

                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-20">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--gospel-primary)] mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                                                </svg>
                                                {formattedDate} • {time}
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                                {item.title}
                                            </h2>
                                            <div className="mt-4 md:mt-0 flex-shrink-0">
                                                <a
                                                    href={item.placeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[color:var(--gospel-primary)] dark:hover:text-[color:var(--gospel-primary)] transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 opacity-70">
                                                        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.62.829.799 1.654 1.381 2.274 1.766.311.192.571.337.757.433.093.048.17.088.232.117.029.014.05.024.066.032l.009.004.003.002zM10 13a4 4 0 100-8 4 4 0 000 8z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{item.placeName}</span>
                                                </a>
                                            </div>
                                            {item.description && (
                                                <div className="mt-4 prose prose-sm dark:prose-invert text-gray-700 dark:text-gray-300">
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
