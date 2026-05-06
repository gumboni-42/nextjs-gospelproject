import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "@/components/CustomPortableText";
import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { ThreeImageSection } from "@/components/ThreeImageSection";
import { PageLogo } from "@/components/PageLogo";
import { CallToAction } from "@/components/CallToAction";

const GOSPELATION_ENGAGIEREN_QUERY = `*[_type == "gospelationEngagierenPage"][0]{
  ...,
  "heroImage": heroImage,
  "logo": logo,
  "callToAction": callToAction {
    text,
    linkType,
    internalLink,
    url
  }
}`;

export const metadata = {
    title: "Engagieren",
    description: "Engagiere dich bei Gospelation – erfahre, wie du aktiv mitgestalten und Teil unserer Gospel-Community werden kannst.",
};

export default async function GospelationEngagierenPage() {
    const data = await sanityFetch<SanityDocument>({ query: GOSPELATION_ENGAGIEREN_QUERY, tags: ['gospelationEngagierenPage'] });

    if (!data) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
                    <p className="text-gray-600">Please configure the Gospelation Engagieren Page in Sanity Studio.</p>
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
                <div className="max-w-2xl mx-auto">
                    <PageLogo logo={data.logo} title={data.title} show={data.showLogo} />
                    {data.subtitle && (
                        <h2 className="text-2xl mb-10 font-medium text-center" style={{ color: 'var(--text-secondary)' }}>
                            {data.subtitle}
                        </h2>
                    )}

                    <div className="prose max-w-none mb-12">
                        {data.body && (
                            <PortableText
                                value={data.body}
                                components={{
                                    types: {
                                        threeImageSection: ThreeImageSection,
                                    },
                                }}
                            />
                        )}
                    </div>

                    <CallToAction data={data.callToAction} />
                </div>
            </div>
        </main>
    );
}
