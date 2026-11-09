import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { PortableText } from "@/components/CustomPortableText";
import { HeroSection } from "@/components/HeroSection";
import { PageLogo } from "@/components/PageLogo";
import CldImage from '@/components/CloudinaryImage';
import { getImageUrl } from "@/sanity/client";

const SPONSOREN_QUERY = `*[_type == "sponsorenPage"][0]{
  ...,
  "mainSponsors": mainSponsors[]{ _key, name, logo, url },
  "goldSponsors": goldSponsors[]{ _key, name, logo, url },
  "otherSponsors": otherSponsors[]{ _key, name, url }
}`;

export const metadata = {
    title: "Sponsoren",
    description: "Unsere Sponsoren – herzlichen Dank allen Firmen und Partnern, die das Gospelproject unterstützen.",
};

type Sponsor = {
    _key?: string;
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logo?: any;
    url?: string;
};

function displayUrl(url: string) {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

function SponsorLogo({ sponsor, sizes }: { sponsor: Sponsor; sizes: string }) {
    if (sponsor.logo?.public_id) {
        return (
            <CldImage
                src={sponsor.logo.public_id}
                alt={sponsor.name}
                fill
                crop="fit"
                sizes={sizes}
                className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
        );
    }
    const src = getImageUrl(sponsor.logo);
    if (src) {
        return (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
                src={src}
                alt={sponsor.name}
                className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
        );
    }
    return (
        <span className="text-lg font-semibold text-center">{sponsor.name}</span>
    );
}

function MaybeLink({ url, label, className, children }: { url?: string; label: string; className: string; children: React.ReactNode }) {
    if (url) {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className={`group ${className}`}>
                {children}
            </a>
        );
    }
    return <div className={className}>{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-3xl font-semibold mb-10 text-center">{children}</h2>;
}

export default async function SponsorenPage() {
    const data = await sanityFetch<SanityDocument>({ query: SPONSOREN_QUERY, tags: ['sponsorenPage'] });

    if (!data) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
                    <p className="text-gray-600">Please configure the Sponsoren Page in Sanity Studio.</p>
                </div>
            </main>
        );
    }

    const mainSponsors: Sponsor[] = data.mainSponsors ?? [];
    const goldSponsors: Sponsor[] = data.goldSponsors ?? [];
    const otherSponsors: Sponsor[] = data.otherSponsors ?? [];

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
                    <PageLogo logo={data.logo} title={data.title} show={data.showLogo} />
                    {!data.heroImage && (
                        <h1 className="text-4xl font-bold mb-8 text-center">{data.title}</h1>
                    )}

                    {data.subtitle && (
                        <h2 className="text-2xl mb-10 font-medium text-center" style={{ color: 'var(--tw-prose-headings)' }}>
                            {data.subtitle}
                        </h2>
                    )}

                    {data.body && (
                        <div className="prose max-w-xl mx-auto mb-16">
                            <PortableText value={data.body} />
                        </div>
                    )}

                    {/* Hauptsponsoren */}
                    {mainSponsors.length > 0 && (
                        <section className="mb-16">
                            <SectionTitle>{data.mainSponsorsTitle || "Hauptsponsoren"}</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-items-center">
                                {mainSponsors.map((sponsor, index) => (
                                    <MaybeLink
                                        key={sponsor._key ?? index}
                                        url={sponsor.url}
                                        label={sponsor.name}
                                        className="w-full max-w-[320px] relative aspect-[3/2] flex items-center justify-center"
                                    >
                                        <SponsorLogo sponsor={sponsor} sizes="(min-width: 768px) 320px, 80vw" />
                                    </MaybeLink>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Goldsponsoren */}
                    {goldSponsors.length > 0 && (
                        <section className="mb-16 border-t pt-16">
                            <SectionTitle>{data.goldSponsorsTitle || "Goldsponsoren"}</SectionTitle>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
                                {goldSponsors.map((sponsor, index) => (
                                    <MaybeLink
                                        key={sponsor._key ?? index}
                                        url={sponsor.url}
                                        label={sponsor.name}
                                        className="flex flex-col items-center text-center"
                                    >
                                        <div className="w-full max-w-[200px] relative aspect-[3/2] flex items-center justify-center mb-4">
                                            <SponsorLogo sponsor={sponsor} sizes="(min-width: 768px) 200px, 40vw" />
                                        </div>
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                            {sponsor.name}
                                        </span>
                                    </MaybeLink>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Übrige Sponsoren */}
                    {otherSponsors.length > 0 && (
                        <section className="mb-8 border-t pt-16">
                            <SectionTitle>{data.otherSponsorsTitle || "Übrige Sponsoren"}</SectionTitle>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 max-w-2xl mx-auto">
                                {otherSponsors.map((sponsor, index) => (
                                    <li key={sponsor._key ?? index} className="flex flex-col">
                                        <span className="font-medium">{sponsor.name}</span>
                                        {sponsor.url && (
                                            <a
                                                href={sponsor.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm hover:underline break-all"
                                                style={{ color: 'var(--gospel-primary)' }}
                                            >
                                                {displayUrl(sponsor.url)}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </main>
    );
}

