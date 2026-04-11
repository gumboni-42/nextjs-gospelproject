import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "next-sanity";
import { HeroSection } from "@/components/HeroSection";

const BEDINGUNGEN_QUERY = `*[_type == "gospelprojectBedingungenPage"][0]{
  ...,
  "heroImage": heroImage,
  "logo": logo,
}`;

export const metadata = {
    title: "Gospelproject - Teilnahmebedingungen",
    description: "Teilnahmebedingungen im Gospelproject",
};

export default async function GospelprojectBedingungenPage() {
    const data = await sanityFetch<SanityDocument>({ query: BEDINGUNGEN_QUERY, tags: ['gospelprojectBedingungenPage'] });

    if (!data) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
                    <p className="text-gray-600">Please configure the Gospelproject Teilnahmebedingungen Page in Sanity Studio.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen">
            <HeroSection
                title={data.title}
                image={data.heroImage}
                logo={data.logo}
            />
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto">
                    {data.subtitle && (
                        <h2 className="text-2xl mb-10 font-medium text-center" style={{ color: 'var(--text-secondary)' }}>
                            {data.subtitle}
                        </h2>
                    )}

                    <div className="prose max-w-none mb-12">
                        {data.body && <PortableText value={data.body} />}
                    </div>
                </div>
            </div>
        </main>
    );
}
