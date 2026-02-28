import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { PortableText } from "next-sanity";
import { HeroSection } from "@/components/HeroSection";
import Image from "next/image";
import { urlFor } from "@/sanity/client";
import Link from "next/link";

const SPONSORING_QUERY = `*[_type == "sponsoringPage"][0]{
  ...,
  "heroImage": heroImage,
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
    title: "Sponsoring | Gospelproject",
    description: "Sponsoring bei Gospelproject",
};

export default async function SponsoringPage() {
    const data = await client.fetch<SanityDocument>(SPONSORING_QUERY);

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
                <div className="max-w-4xl mx-auto">
                    {!data.heroImage && (
                        <h1 className="text-4xl font-bold mb-8 text-center">{data.title}</h1>
                    )}

                    {data.subtitle && (
                        <h2 className="text-2xl text-gray-600 mb-10 font-medium text-center">
                            {data.subtitle}
                        </h2>
                    )}

                    <div className="prose max-w-none mb-16">
                        {data.body && <PortableText value={data.body} />}
                    </div>

                    {data.qrCodeImage && (
                        <div className="mb-16 flex flex-col items-center">
                            <h3 className="text-2xl font-semibold mb-6">Mit TWINT unterstützen</h3>
                            <div className="relative w-64 h-64 border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <Image
                                    src={urlFor(data.qrCodeImage).url()}
                                    alt="TWINT QR Code für Gospelproject"
                                    fill
                                    className="object-contain p-4"
                                />
                            </div>
                        </div>
                    )}

                    {data.pastMainSponsors && data.pastMainSponsors.length > 0 && (
                        <div className="mb-16 border-t pt-16">
                            <h3 className="text-2xl font-semibold mb-8 text-center">Unsere bisherigen Hauptsponsoren</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-items-center">
                                {data.pastMainSponsors.map((sponsor: { name: string, logo: Record<string, unknown>, url?: string }, index: number) => (
                                    <div key={index} className="w-full max-w-[240px] relative aspect-[3/2] flex items-center justify-center">
                                        {sponsor.url ? (
                                            <Link href={sponsor.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
                                                {sponsor.logo && (
                                                    <Image
                                                        src={urlFor(sponsor.logo).url()}
                                                        alt={sponsor.name}
                                                        fill
                                                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                )}
                                            </Link>
                                        ) : (
                                            <div className="w-full h-full relative">
                                                {sponsor.logo && (
                                                    <Image
                                                        src={urlFor(sponsor.logo).url()}
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

                    {data.mediaPartner && data.mediaPartner.name && data.mediaPartner.logo && (
                        <div className="mb-8 border-t pt-16">
                            <h3 className="text-xl font-medium mb-8 text-center text-gray-500 uppercase tracking-widest">Medienpartner</h3>
                            <div className="flex justify-center">
                                <div className="w-full max-w-[200px] relative aspect-square flex items-center justify-center">
                                    {data.mediaPartner.url ? (
                                        <Link href={data.mediaPartner.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group opacity-80 hover:opacity-100 transition-opacity">
                                            <Image
                                                src={urlFor(data.mediaPartner.logo).url()}
                                                alt={data.mediaPartner.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </Link>
                                    ) : (
                                        <div className="w-full h-full relative opacity-80">
                                            <Image
                                                src={urlFor(data.mediaPartner.logo).url()}
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
