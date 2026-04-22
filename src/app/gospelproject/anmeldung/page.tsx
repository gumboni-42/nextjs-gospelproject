import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "next-sanity";
import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { PageLogo } from "@/components/PageLogo";
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
    title: "Anmeldung",
    description: "Jetzt für das Gospelproject anmelden – sichere dir deinen Platz im nächsten Chor-Erlebnis.",
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
                        {data.body && <PortableText value={data.body} />}
                    </div>

                    <div className="rounded-2xl p-8 sm:p-12" style={{ backgroundColor: 'var(--surface)' }}>
                        <h2 className="text-3xl font-bold mb-2 text-center">Jetzt Anmelden</h2>
                        {data.signupLimit && data.signupCount >= data.signupLimit ? (
                            <div className="text-center p-12 rounded-2xl border my-8" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)' }}>
                                <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                                    {data.ausgebuchtTitle || "Ausgebucht"}
                                </h3>
                                <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
                                    {data.ausgebuchtText || "Leider sind für dieses Projekt bereits alle Plätze belegt. Wir freuen uns, wenn du beim nächsten Mal dabei bist!"}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                                    {data.signupFormText ? (
                                        <PortableText value={data.signupFormText} />
                                    ) : (
                                        <p>Fülle das Formular aus, um dich für das nächste Gospelproject anzumelden.</p>
                                    )}
                                </div>
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
