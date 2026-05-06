import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "@/components/CustomPortableText";
import { HeroSection } from "@/components/HeroSection";
import { PageLogo } from "@/components/PageLogo";
import { CallToAction } from "@/components/CallToAction";

const TERMINE_QUERY = `*[_type == "gospelprojectTerminePage"][0]{
  ...,
  "heroImage": heroImage,
  "htmlTable": htmlTable,
  "logo": logo,
  "pdfDownloadUrl": pdfDownload.asset->url,
  "callToAction": callToAction {
    text,
    linkType,
    internalLink,
    url
  }
}`;

export const metadata = {
    title: "Termine",
    description: "Alle Probentermine und wichtige Daten für das aktuelle Gospelproject – auch als PDF zum Herunterladen.",
};

export default async function GospelprojectTerminePage() {
    const data = await sanityFetch<SanityDocument>({ query: TERMINE_QUERY, tags: ['gospelprojectTerminePage'] });

    if (!data) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
                    <p className="text-gray-600">Please configure the Gospelproject Termine Page in Sanity Studio.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen">
            <HeroSection
                title={data.title}
                image={data.heroImage}
            />
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <PageLogo logo={data.logo} title={data.title} show={data.showLogo} />
                    {data.subtitle && (
                        <h2 className="text-2xl mb-10 font-medium text-center" style={{ color: 'var(--text-secondary)' }}>
                            {data.subtitle}
                        </h2>
                    )}

                    <div className="prose max-w-none mb-12">
                        {data.body && <PortableText value={data.body} />}
                        {data.pdfDownloadUrl && (
                            <div className="mb-12 text-center">
                                <a
                                    href={data.pdfDownloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium border border-gray-300"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Termine als PDF herunterladen
                                </a>
                            </div>
                        )}
                    </div>

                    {data.htmlTable && (
                        <div
                            className="prose max-w-none mb-6 html-table-container"
                            dangerouslySetInnerHTML={{ __html: data.htmlTable }}
                        />
                    )}
                    <p className="text-sm">* Zeit entspricht dem Beginn der Veranstaltung, Chor trifft sich zur Vorprobe jeweils schon 2 Stunden früher</p>
                    <p className="text-sm text-[var(--text-muted)]">Version vom 04.05.2026</p>

                    <CallToAction data={data.callToAction} />
                </div>
            </div>
        </main>
    );
}
