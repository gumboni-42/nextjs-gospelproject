import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "@/components/CustomPortableText";
import { YouTubeHero } from "@/components/YouTubeHero";
import ZusammenklangForm from "@/components/ZusammenklangForm";

const ZUSAMMENKLANG_QUERY = `*[_type == "zusammenklangPage"][0]{
  title,
  subtitle,
  youtubeUrl,
  body,
  contact,
  "sponsoringKonzeptPdf": sponsoringKonzeptPdf.asset->url,
  formIntroText
}`;

export const metadata = {
    title: "Zusammenklang",
    description: "Zusammenklang – werde Sponsor oder Spender für das Gospelproject und unterstütze unser gemeinsames Gospeln.",
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
                            <a
                                href={data.sponsoringKonzeptPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium border border-gray-300"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Sponsoring-Konzept herunterladen
                            </a>
                        </div>
                    )}

                    {/* contact content */}
                    <div className="prose max-w-none mb-12">
                        {data.contact && <PortableText value={data.contact} />}
                    </div>

                    {/* Form Section */}
                    <div className="border-t pt-12" style={{ borderColor: 'var(--border-color)' }}>
                        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--foreground)' }}>
                            Anmeldung als Sponsor oder Spender
                        </h2>
                        <div className="rounded-2xl p-8 sm:p-12" style={{ backgroundColor: 'var(--surface)' }}>
                            <ZusammenklangForm introText={data.formIntroText} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
