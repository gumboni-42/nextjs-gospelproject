
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";

interface AgendaItem extends SanityDocument {
    _id: string;
    date: string;
    title: string;
    placeName: string;
    placeUrl: string;
    active: boolean;
}

const AGENDA_QUERY = `*[
  _type == "agenda"
  && active == true
]|order(date asc){_id, date, title, placeName, placeUrl}`;

const options = { next: { revalidate: 60 } };

export const metadata = {
    title: "Agenda - Gospel Project",
    description: "Upcoming gigs and events.",
};

export default async function AgendaPage() {
    const agendaItems = await client.fetch<AgendaItem[]>(AGENDA_QUERY, {}, options);

    return (
        <main className="container mx-auto min-h-screen max-w-4xl p-8">
            <h1 className="text-5xl font-extrabold mb-12 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Upcoming Gigs
            </h1>

            {agendaItems.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    <p className="text-xl">No upcoming events at the moment.</p>
                    <p>Check back soon!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {agendaItems.map((item) => {
                        const date = new Date(item.date);
                        const formattedDate = date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        });
                        const time = date.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                        });

                        return (
                            <div
                                key={item._id}
                                className="group relative overflow-hidden rounded-2xl bg-white/5 p-6 shadow-lg ring-1 ring-gray-900/5 transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-white/5 dark:ring-white/10"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                                            </svg>
                                            {formattedDate} • {time}
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                            {item.title}
                                        </h2>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 opacity-70">
                                                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.62.829.799 1.654 1.381 2.274 1.766.311.192.571.337.757.433.093.048.17.088.232.117.029.014.05.024.066.032l.009.004.003.002zM10 13a4 4 0 100-8 4 4 0 000 8z" clipRule="evenodd" />
                                            </svg>
                                            <span>{item.placeName}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 md:mt-0 flex-shrink-0">
                                        <a
                                            href={item.placeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                                        >
                                            Get Directions
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1.5">
                                                <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17H4.25A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                                                <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
