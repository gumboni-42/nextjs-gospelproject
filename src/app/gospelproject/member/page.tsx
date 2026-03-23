import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "next-sanity";
import { HeroSection } from "@/components/HeroSection";
import { CallToAction } from "@/components/CallToAction";
import { MemberPasswordGate } from "@/components/MemberPasswordGate";
import { cookies } from "next/headers";

const MEMBER_QUERY = `*[_type == "gospelprojectMemberPage"][0]{
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
    title: "Gospelproject - Members",
    description: "Mitgliederbereich des Gospelproject",
};

export default async function GospelprojectMemberPage() {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get('member-auth')?.value === 'authenticated';

    if (!isAuthenticated) {
        return <MemberPasswordGate />;
    }

    const data = await sanityFetch<SanityDocument>({ query: MEMBER_QUERY, tags: ['gospelprojectMemberPage'] });

    if (!data) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
                    <p className="text-gray-600">Please configure the Gospelproject Member Page in Sanity Studio.</p>
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

                    <CallToAction data={data.callToAction} />
                </div>
            </div>
        </main>
    );
}
