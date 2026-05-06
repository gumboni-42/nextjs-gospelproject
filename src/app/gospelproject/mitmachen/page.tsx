import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "@/components/CustomPortableText";
import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { PageLogo } from "@/components/PageLogo";
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
    title: "Mitmachen",
    description: "Mach mit beim Gospelproject – alle Infos zur Teilnahme, Voraussetzungen und wie du dich anmelden kannst.",
};

export default async function GospelprojectMitmachenPage() {
    const data = await sanityFetch<SanityDocument>({ query: MITMACHEN_QUERY, tags: ['gospelprojectMitmachenPage'] });

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
