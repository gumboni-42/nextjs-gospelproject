import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "next-sanity";
import { HeroSection } from "@/components/HeroSection";
import { CallToAction } from "@/components/CallToAction";
import { SignupFormGospelverein } from "@/components/SignupFormGospelverein";
import Image from "next/image";

const GOSPELVEREIN_QUERY = `*[_type == "gospelvereinPage"][0]{
  ...,
  "heroImage": heroImage,
  "logo": logo,
  "twintImage": twintImage,
  "statutenFile": statutenFile.asset->url,
  "organigramm": organigramm,
  "gospelFriends": gospelFriends,
  "callToAction": callToAction {
    text,
    linkType,
    internalLink,
    url
  }
}`;

export const metadata = {
    title: "Gospelverein - Gospelproject",
    description: "Der Gospelverein - Mitgliedschaft, Gönner werden und Spenden",
};

export default async function GospelvereinPage() {
    const data = await sanityFetch<SanityDocument>({ query: GOSPELVEREIN_QUERY, tags: ['gospelvereinPage'] });

    if (!data) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
                    <p className="text-gray-600">Please configure the Gospelverein Page in Sanity Studio.</p>
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
                        <h2 className="text-2xl text-gray-200 mb-10 font-medium text-center">
                            {data.subtitle}
                        </h2>
                    )}

                    <div className="prose max-w-none mb-12">
                        {data.body && <PortableText value={data.body} />}
                    </div>

                    {data.organigramm && (
                        <div className="mb-12">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${data.organigramm.public_id}`}
                                alt="Organigramm"
                                className="w-full h-auto rounded-2xl shadow-lg"
                                loading="lazy"
                            />
                        </div>
                    )}

                    {data.mitgliedschaftText && (
                        <div className="prose max-w-none mb-12">
                            <PortableText value={data.mitgliedschaftText} />
                        </div>
                    )}

                    {data.statutenFile && (
                        <div className="mb-12 text-center">
                            <a
                                href={data.statutenFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium border border-gray-300"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Statuten Herunterladen
                            </a>
                        </div>
                    )}

                    {data.gospelFriends && (
                        <div className="bg-gray-100 rounded-2xl mb-16 relative overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${data.gospelFriends.public_id}`}
                                alt="GospelFriends"
                                className="w-full h-auto rounded-2xl shadow-lg"
                                loading="lazy"
                            />
                        </div>
                    )}

                    <div className="bg-gray-800/50 rounded-2xl p-8 sm:p-12 mb-16 relative overflow-hidden text-gray-100">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4 text-center">Gönner werden</h2>
                            <p className="text-center text-gray-400 mb-8 max-w-xl mx-auto">
                                Möchtest Du als Gönner unsere Gospeln ideel und finanziell unterstützen? Ab CHF 50.– im Jahr bist du dabei.
                            </p>
                            <SignupFormGospelverein />
                        </div>
                    </div>

                    {data.twintImage && (
                        <div className="mb-16 text-center max-w-md mx-auto">
                            <h2 className="text-2xl font-bold mb-6">Spende per Twint</h2>
                            <p className="text-gray-400 mb-6">
                                Wenn du lieber eine einmalige Spende vornehmen möchtest, kannst du dazu unkompliziert den folgenden Twint-QR-Code benutzen. DANKE für deine Unterstützung!
                            </p>
                            <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${data.twintImage.public_id}`}
                                    alt="Twint QR Code für Spenden"
                                    className="w-full max-w-[250px] h-auto object-contain mx-auto"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    )}

                    {data.callToAction && <CallToAction data={data.callToAction} />}
                </div>
            </div>
        </main>
    );
}