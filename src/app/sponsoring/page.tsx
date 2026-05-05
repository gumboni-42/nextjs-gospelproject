import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "next-sanity";
import { HeroSection } from "@/components/HeroSection";
import { PageLogo } from "@/components/PageLogo";
import CldImage from '@/components/CloudinaryImage';
import { getImageUrl } from "@/sanity/client";
import Link from "next/link";

const SPONSORING_QUERY = `*[_type == "sponsoringPage"][0]{
  ...,
  "heroImage": heroImage,
  "logo": logo,
  "qrCodeImage": qrCodeImage,
  "pastMainSponsors": pastMainSponsors[]{
    name,
    logo,
    url
  },
  "mediaPartner": mediaPartner {
    name,
    logo,
    url
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
                    <PageLogo logo={data.logo} title={data.title} show={data.showLogo} />
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

                    {data.qrCodeImage?.public_id ? (
                        <div className="mb-16 flex flex-col items-center">
                            <CldImage
                                src={data.qrCodeImage.public_id}
                                alt="TWINT QR Code für Gospelproject"
                                width={600}
                                height={600}
                                crop="limit"
                                preserveTransformations={true}
                                className="object-contain rounded-lg w-full h-auto"
                            />
                        </div>
                    ) : getImageUrl(data.qrCodeImage) && (
                        <div className="mb-16 flex flex-col items-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={getImageUrl(data.qrCodeImage) as string}
                                alt="TWINT QR Code für Gospelproject"
                                className="object-contain rounded-lg w-full h-auto"
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
                                                {sponsor.logo?.public_id ? (
                                                    <CldImage
                                                        src={sponsor.logo.public_id}
                                                        alt={sponsor.name}
                                                        fill
                                                        crop="fit"
                                                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : getImageUrl(sponsor.logo) && (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img
                                                        src={getImageUrl(sponsor.logo) as string}
                                                        alt={sponsor.name}
                                                        className="object-contain group-hover:scale-105 transition-transform duration-300 w-full h-full"
                                                    />
                                                )}
                                            </Link>
                                        ) : (
                                            <div className="w-full h-full relative">
                                                {sponsor.logo?.public_id ? (
                                                    <CldImage
                                                        src={sponsor.logo.public_id}
                                                        alt={sponsor.name}
                                                        fill
                                                        crop="fit"
                                                        className="object-contain"
                                                    />
                                                ) : getImageUrl(sponsor.logo) && (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img
                                                        src={getImageUrl(sponsor.logo) as string}
                                                        alt={sponsor.name}
                                                        className="object-contain w-full h-full"
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
                                            {data.mediaPartner.logo?.public_id ? (
                                                <CldImage
                                                    src={data.mediaPartner.logo.public_id}
                                                    alt={data.mediaPartner.name}
                                                    fill
                                                    crop="fit"
                                                    className="object-contain"
                                                />
                                            ) : getImageUrl(data.mediaPartner.logo) && (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={getImageUrl(data.mediaPartner.logo) as string}
                                                    alt={data.mediaPartner.name}
                                                    className="object-contain w-full h-full"
                                                />
                                            )}
                                        </Link>
                                    ) : (
                                        <div className="w-full h-full relative opacity-80">
                                            {data.mediaPartner.logo?.public_id ? (
                                                <CldImage
                                                    src={data.mediaPartner.logo.public_id}
                                                    alt={data.mediaPartner.name}
                                                    fill
                                                    crop="fit"
                                                    className="object-contain"
                                                />
                                            ) : getImageUrl(data.mediaPartner.logo) && (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={getImageUrl(data.mediaPartner.logo) as string}
                                                    alt={data.mediaPartner.name}
                                                    className="object-contain w-full h-full"
                                                />
                                            )}
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
