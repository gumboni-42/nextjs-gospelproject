import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { PortableText } from "next-sanity";
import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { ThreeImageSection } from "@/components/ThreeImageSection";
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
    title: "Gospelation - Engagieren",
    description: "Engagiere dich bei Gospelation",
};

export default async function GospelationEngagierenPage() {
    const data = await client.fetch<SanityDocument>(GOSPELATION_ENGAGIEREN_QUERY);

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
                logo={data.logo}
            />
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {data.subtitle && (
                        <h2 className="text-2xl text-white mb-10 font-medium text-center">
                            {data.subtitle}
                        </h2>
                    )}

                    <div className="prose prose-lg max-w-none mb-12">
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
