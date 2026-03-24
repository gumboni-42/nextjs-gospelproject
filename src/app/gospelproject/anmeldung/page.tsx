import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
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
    const data = await sanityFetch<SanityDocument>({ query: ANMELDUNG_QUERY, tags: ['gospelprojectAnmeldungPage'] });

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
                <div className="max-w-2xl mx-auto">
                    {data.subtitle && (
                        <h2 className="text-2xl text-gray-300 mb-10 font-medium text-center">
                            {data.subtitle}
                        </h2>
                    )}

                    <div className="prose max-w-none mb-12">
                        {data.body && <PortableText value={data.body} />}
                    </div>

                    <div className="bg-gray-800/50 rounded-2xl p-8 sm:p-12">
                        <h2 className="text-3xl font-bold mb-2 text-center">Jetzt Anmelden</h2>
                        {data.signupLimit && data.signupCount >= data.signupLimit ? (
                            <div className="text-center p-12 bg-gray-900/50 rounded-2xl border border-gray-800 my-8">
                                <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h3 className="text-2xl font-bold text-white mb-4">Ausgebucht</h3>
                                <p className="text-gray-400 text-lg">Leider sind für dieses Projekt bereits alle Plätze belegt. Wir freuen uns, wenn du beim nächsten Mal dabei bist!</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-center text-gray-400 mb-8 max-w-xl mx-auto">Fülle das Formular aus, um dich für das nächste Gospelproject anzumelden.</p>
                                <SignupForm />
                            </>
                        )}
                    </div>

                    <CallToAction data={data.callToAction} />
                </div>
            </div>
        </main>
    );
}
