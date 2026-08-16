import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "@/components/CustomPortableText";
import { HeroSection } from "@/components/HeroSection";
import { PageLogo } from "@/components/PageLogo";
import { CallToAction } from "@/components/CallToAction";
import { MemberPasswordGate } from "@/components/MemberPasswordGate";
import { MemberDownloadsTable } from "@/components/MemberDownloadsTable";
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
  },
  "downloads": downloads[]{
    _key,
    title,
    description,
    isNew,
    "fileUrl": file.asset->url,
    "fileSize": file.asset->size,
    "originalFilename": file.asset->originalFilename,
    "fileExtension": file.asset->extension,
    "mimeType": file.asset->mimeType,
    "uploadedAt": file.asset->_createdAt,
    externalUrl,
    customFilename,
    customFilesize,
    customUploadDate
  }
}`;

export const metadata = {
    title: "Mitgliederbereich",
    description: "Geschützter Mitgliederbereich des Gospelproject – exklusive Inhalte und Informationen für Teilnehmende.",
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
            />
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="max-w-2xl mx-auto">
                        <PageLogo logo={data.logo} title={data.title} show={data.showLogo} />
                        {data.subtitle && (
                            <h2 className="text-2xl mb-10 font-medium text-center" style={{ color: 'var(--text-secondary)' }}>
                                {data.subtitle}
                            </h2>
                        )}

                        <div className="prose max-w-none mb-8">
                            {data.body && <PortableText value={data.body} />}
                        </div>
                    </div>

                    <MemberDownloadsTable
                        items={data.downloads}
                        sectionTitle={data.downloadsSectionTitle}
                        sectionDescription={data.downloadsSectionDescription}
                    />

                    <div className="max-w-2xl mx-auto">
                        <CallToAction data={data.callToAction} />
                    </div>
                </div>
            </div>
        </main>
    );
}

