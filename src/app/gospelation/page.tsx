import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "@/components/CustomPortableText";
import { HeroSection } from "@/components/HeroSection";
import { PageLogo } from "@/components/PageLogo";
import { CallToAction } from "@/components/CallToAction";
import { PopupModal } from "@/components/PopupModal";
import { InfoText } from "@/components/InfoText";

const GOSPELATION_QUERY = `*[_type == "gospelationPage"][0]{
  ...,
  "heroImage": heroImage,
  "logo": logo,
  "callToAction": callToAction {
    text,
    linkType,
    internalLink,
    url
  },
  "popupModal": popupModal {
    buttonText,
    image,
    text
  }
}`;

export const metadata = {
    title: "Gospelation",
    description: "Gospelation – das ganze Jahr Gospel erleben. Regelmässige Proben, Auftritte und Gemeinschaft für alle, die Gospel lieben.",
};

export default async function GospelationPage() {
    const data = await sanityFetch<SanityDocument>({ query: GOSPELATION_QUERY, tags: ['gospelationPage'] });

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
            />
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto">
                    <InfoText className="mb-6 text-center" hideAfter="2026-07-05T18:00:00+02:00">
                        Anmeldung für Nachtessen/Tavolata ist nicht mehr möglich oder abgelaufen. <br />
                        Über deinen Besuch vom Gottesdienst freuen wir uns.
                    </InfoText>
                    <PageLogo logo={data.logo} title={data.title} show={data.showLogo} />
                    {data.subtitle && (
                        <h2 className="text-2xl mb-10 text-center">
                            {data.subtitle}
                        </h2>
                    )}

                    <div className="prose max-w-none mb-12">
                        {data.body && <PortableText value={data.body} />}
                    </div>

                    <CallToAction data={data.callToAction} />
                </div>
            </div>
        </main>
    );
}