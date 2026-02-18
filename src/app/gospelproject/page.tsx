import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { PortableText } from "next-sanity";
import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";

const GOSPELATION_QUERY = `*[_type == "gospelprojectPage"][0]{
  ...,
  "heroImage": heroImage,
  "logo": logo
}`;

export const metadata = {
    title: "Gospelproject",
    description: "Gospelproject - Gospel all year long",
};

export default async function GospelprojectPage() {
    const data = await client.fetch<SanityDocument>(GOSPELATION_QUERY);

    if (!data) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
                    <p className="text-gray-600">Please configure the Gospelation Page in Sanity Studio.</p>
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
                <div className="max-w-4xl mx-auto">
                    {data.subtitle && (
                        <h2 className="text-2xl text-gray-600 mb-10 font-medium text-center">
                            {data.subtitle}
                        </h2>
                    )}

                    <div className="prose prose-lg max-w-none mb-12">
                        {data.body && <PortableText value={data.body} />}
                    </div>

                    {data.callToAction?.url && (
                        <div className="flex justify-center mt-8">
                            <Link
                                href={data.callToAction.url}
                                className="inline-block px-8 py-4 text-white font-bold rounded-lg transition-transform hover:scale-105"
                                style={{ backgroundColor: 'var(--gospel-primary)' }}
                            >
                                {data.callToAction.text || 'Learn More'}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}