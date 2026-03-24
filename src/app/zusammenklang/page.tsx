import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "next-sanity";
import { YouTubeHero } from "@/components/YouTubeHero";
import ZusammenklangForm from "@/components/ZusammenklangForm";
import Link from "next/link";

const ZUSAMMENKLANG_QUERY = `*[_type == "zusammenklangPage"][0]{
  title,
  subtitle,
  youtubeUrl,
  body,
  sponsoringKonzeptPdf,
  formIntroText
}`;

export const metadata = {
    title: "Zusammenklang | Gospelproject",
    description: "Sponsoring und Spenden für Gospelproject",
};

export default async function ZusammenklangPage() {
    const data = await sanityFetch<SanityDocument>({ query: ZUSAMMENKLANG_QUERY, tags: ['zusammenklangPage'] });

    if (!data) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
                    <p className="text-gray-600">Please configure the Zusammenklang Page in Sanity Studio.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen">
            {/* YouTube Hero — replaces the regular hero section */}
            {data.youtubeUrl ? (
                <div className="pt-16">
                    <YouTubeHero url={data.youtubeUrl} title={data.title} />
                </div>
            ) : (
                <div className="pt-32" />
            )}

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-xl mx-auto">

                    {/* Body content */}
                    <div className="prose max-w-none mb-12">
                        {data.body && <PortableText value={data.body} />}
                    </div>

                    {/* Sponsoring Konzept PDF link */}
                    {data.sponsoringKonzeptPdf && (
                        <div className="mb-12 text-center">
                            <Link
                                href={data.sponsoringKonzeptPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-lg transition-all transform active:scale-[0.98]"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                Sponsoring-Konzept herunterladen
                            </Link>
                        </div>
                    )}

                    {/* Form Section */}
                    <div className="border-t border-gray-700 pt-12">
                        <h2 className="text-2xl font-bold mb-8 text-center text-white">
                            Anmeldung als Sponsor oder Spender
                        </h2>
                        <div className="shadow-xl rounded-2xl overflow-hidden p-8 sm:p-12">
                            <ZusammenklangForm introText={data.formIntroText} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
