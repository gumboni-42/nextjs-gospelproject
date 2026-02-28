import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { PortableText } from "next-sanity";
import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { CallToAction } from "@/components/CallToAction";

const MITMACHEN_QUERY = `*[_type == "gospelprojectMitmachenPage"][0]{
  ...,
  "heroImage": heroImage,
  "logo": logo,
  "projectStatus": projectStatus,
  "inactiveBody": inactiveBody,
  "callToAction": callToAction {
    text,
    linkType,
    internalLink,
    url
  }
}`;

export const metadata = {
    title: "Gospelproject - Mitmachen",
    description: "Mitmachen bei Gospelproject",
};

export default async function GospelprojectMitmachenPage() {
    const data = await client.fetch<SanityDocument>(MITMACHEN_QUERY);

    if (!data) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
                    <p className="text-gray-600">Please configure the Gospelproject Mitmachen Page in Sanity Studio.</p>
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

                    <div className="prose max-w-none mb-12">
                        {data.projectStatus !== false ? (
                            data.body && <PortableText value={data.body} />
                        ) : (
                            data.inactiveBody && <PortableText value={data.inactiveBody} />
                        )}
                    </div>

                    {data.projectStatus !== false && (
                        <CallToAction data={data.callToAction} />
                    )}
                </div>
            </div>
        </main>
    );
}
