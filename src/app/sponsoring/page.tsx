import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "next-sanity";
import { HeroSection } from "@/components/HeroSection";
import { PageLogo } from "@/components/PageLogo";
import Image from "next/image";
import { getImageUrl } from "@/sanity/client";
import Link from "next/link";

const SPONSORING_QUERY = `*[_type == "sponsoringPage"][0]{
  ...,
  "heroImage": heroImage,
  "logo": logo,
  "qrCodeImage": qrCodeImage,
  "pastMainSponsors": pastMainSponsors[]{
    "name": sponsor.name,
    "logo": sponsor.logo,
    "url": sponsor.url
  },
  "mediaPartner": {
    "name": mediaPartner.name,
    "logo": mediaPartner.logo,
    "url": mediaPartner.url
  }
}`;

export const metadata = {
    title: "Sponsoring",
    description: "Werde Sponsor des Gospelproject – unterstütze unsere Gospel-Events und profitiere von attraktiven Sponsoring-Paketen.",
};

export default async function SponsoringPage() {
    const data = await sanityFetch<SanityDocument>({ query: SPONSORING_QUERY, tags: ['sponsoringPage'] });

    if (!data) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
                    <p className="text-gray-600">Please configure the Sponsoring Page in Sanity Studio.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen">
            {data.heroImage && (
                <HeroSection
                    title={data.title}
                    image={data.heroImage}
                />
            )}

            <div className={`container mx-auto px-4 ${data.heroImage ? 'py-16' : 'pt-32 pb-16'}`}>
                <div className="max-w-xl mx-auto">
                    <PageLogo logo={data.logo} title={data.title} />
                    {!data.heroImage && (
                        <h1 className="text-4xl font-bold mb-8 text-center">{data.title}</h1>
                    )}

                    {data.subtitle && (
                        <h2 className="text-2xl mb-10 font-medium text-center" style={{ color: 'var(--tw-prose-headings)' }}>
                            {data.subtitle}
                        </h2>
                    )}

                    <div className="prose max-w-none mb-16">
                        {data.body && <PortableText value={data.body} />}
                    </div>

                    {getImageUrl(data.qrCodeImage) && (
                        <div className="mb-16 flex flex-col items-center">
                            <Image
                                src={getImageUrl(data.qrCodeImage) as string}
                                alt="TWINT QR Code für Gospelproject"
                                width={0}
                                height={0}
                                sizes="100vw"
                                style={{ width: '100%', height: 'auto' }}
                                className="object-contain rounded-lg"
                            />

                        </div>
                    )}

                    {data.pastMainSponsors && data.pastMainSponsors.length > 0 && (
                        <div className="mb-16 border-t pt-16">
                            <h3 className="text-2xl font-semibold mb-8 text-center">Unsere bisherigen Hauptsponsoren</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-items-center">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {data.pastMainSponsors.map((sponsor: { name: string, logo: any, url?: string }, index: number) => (
                                    <div key={index} className="w-full max-w-[240px] relative aspect-[3/2] flex items-center justify-center">
                                        {sponsor.url ? (
                                            <Link href={sponsor.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
                                                {getImageUrl(sponsor.logo) && (
                                                    <Image
                                                        src={getImageUrl(sponsor.logo) as string}
                                                        alt={sponsor.name}
                                                        fill
                                                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                )}
                                            </Link>
                                        ) : (
                                            <div className="w-full h-full relative">
                                                {getImageUrl(sponsor.logo) && (
                                                    <Image
                                                        src={getImageUrl(sponsor.logo) as string}
                                                        alt={sponsor.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.mediaPartner?.name && getImageUrl(data.mediaPartner?.logo) && (
                        <div className="mb-8 border-t pt-16">
                            <h3 className="text-xl font-medium mb-8 text-center text-(--tw-prose-headings) uppercase tracking-widest">Medienpartner</h3>
                            <div className="flex justify-center">
                                <div className="w-full max-w-[200px] relative aspect-square flex items-center justify-center">
                                    {data.mediaPartner.url ? (
                                        <Link href={data.mediaPartner.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group opacity-80 hover:opacity-100 transition-opacity">
                                            <Image
                                                src={getImageUrl(data.mediaPartner.logo) as string}
                                                alt={data.mediaPartner.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </Link>
                                    ) : (
                                        <div className="w-full h-full relative opacity-80">
                                            <Image
                                                src={getImageUrl(data.mediaPartner.logo) as string}
                                                alt={data.mediaPartner.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
