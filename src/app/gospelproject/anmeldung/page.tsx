import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { PortableText } from "next-sanity";
import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { CallToAction } from "@/components/CallToAction";
import { SignupForm } from "@/components/SignupForm";

const ANMELDUNG_QUERY = `*[_type == "gospelprojectAnmeldungPage"][0]{
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
    title: "Gospelproject - Anmeldung",
    description: "Anmeldung für Gospelproject",
};

export default async function GospelprojectAnmeldungPage() {
    const data = await client.fetch<SanityDocument>(ANMELDUNG_QUERY);

    if (!data) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
                    <p className="text-gray-600">Please configure the Gospelproject Anmeldung Page in Sanity Studio.</p>
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
                        {data.body && <PortableText value={data.body} />}
                    </div>

                    <div className="p-8 sm:p-12">
                        <h2 className="text-3xl font-bold mb-2 text-center">Jetzt Anmelden</h2>
                        <p className="text-center text-gray-400 mb-8 max-w-xl mx-auto">Fülle das Formular aus, um dich für das nächste Gospelproject anzumelden.</p>
                        <SignupForm />
                    </div>

                    <CallToAction data={data.callToAction} />
                </div>
            </div>
        </main>
    );
}
