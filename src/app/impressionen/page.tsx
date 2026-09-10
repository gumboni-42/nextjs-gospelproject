import { type SanityDocument } from "next-sanity";
import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import { GalleryView } from "@/components/GalleryView";
import { HeroSection } from "@/components/HeroSection";
import { VideoGallery } from "@/components/VideoGallery";
import { PortableText } from "@/components/CustomPortableText";
import { PageLogo } from "@/components/PageLogo";
import CldImage from "@/components/CloudinaryImage";

interface CloudinaryAsset {
    _key: string;
    secure_url: string;
    public_id: string;
    context?: {
        custom?: {
            alt?: string;
        }
    }
}

interface YearEntry {
    _key: string;
    year: string;
    eventName?: string;
    images: CloudinaryAsset[];
}

interface CDItem {
    _key?: string;
    image?: CloudinaryAsset;
    title?: string;
    link?: string;
}

interface CDPromo {
    title?: string;
    cds?: CDItem[];
}

interface GalleryDocument extends SanityDocument {
    years?: YearEntry[];
    videos?: {
        _key: string;
        title: string;
        youtubeUrl: string;
        isPublic?: boolean;
        thumbnail?: CloudinaryAsset;
    }[];
    title?: string;
    subtitle?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    heroImage?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logo?: any;
    showLogo?: boolean;
    cdPromo?: CDPromo;
}

const GALLERY_QUERY = `*[_type == "impressionenPage"][0]{
  ...,
  years[]{
    ...,
    images[]{
      ...,
      "secure_url": secure_url,
      "public_id": public_id,
      "context": context
    }
  },
  videos[]{
    ...,
    isPublic,
    thumbnail{
      ...,
      "secure_url": secure_url,
      "public_id": public_id,
      "context": context
    }
  },
  cdPromo{
    ...,
    cds[]{
      ...,
      image{
        ...,
        "secure_url": secure_url,
        "public_id": public_id,
        "context": context
      }
    }
  }
}`;



export const metadata = {
    title: "Impressionen",
    description: "Bildergalerie des Gospelproject – Eindrücke und Fotos von unseren Konzerten, Proben und Events.",
};

export default async function ImpressionenPage() {
    const galleryData = await sanityFetch<GalleryDocument>({ query: GALLERY_QUERY, tags: ['impressionenPage'] });

    if (!galleryData) {
        return (
            <main className="container mx-auto min-h-screen px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Impressionen</h1>
                <p className="text-gray-600">Keine Inhalte gefunden. Bitte erstelle die &quot;Impressionen Page&quot; in Sanity.</p>
            </main>
        );
    }

    const hasCds = Boolean(galleryData.cdPromo?.cds && galleryData.cdPromo.cds.length > 0);
    const hasBody = Boolean(galleryData.body);
    const hasBoth = hasBody && hasCds;

    return (
        <main className="min-h-screen">
            <HeroSection
                title={galleryData.title || 'Impressionen'}
                image={galleryData.heroImage}
            />
            <VideoGallery videos={galleryData.videos} />
            {(hasBody || galleryData.subtitle || (galleryData.showLogo && galleryData.logo) || hasCds) && (
                <div className="container mx-auto px-4 py-16">
                    <div className={`${hasBoth ? 'max-w-5xl' : 'max-w-2xl'} mx-auto`}>
                        <PageLogo logo={galleryData.logo} title={galleryData.title} show={galleryData.showLogo} />
                        {galleryData.subtitle && (
                            <h2 className="text-2xl mb-10 font-medium text-center" style={{ color: 'var(--text-secondary)' }}>
                                {galleryData.subtitle}
                            </h2>
                        )}

                        <div className={hasBoth ? 'grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center' : ''}>
                            {hasBody && (
                                <div className="prose max-w-none">
                                    <PortableText value={galleryData.body} />
                                </div>
                            )}

                            {hasCds && (
                                <div className={`w-full ${!hasBoth && hasBody ? 'mt-12' : ''}`}>
                                    {galleryData.cdPromo?.title && (
                                        <h3 className="text-xl font-bold text-center mb-6">
                                            {galleryData.cdPromo.title}
                                        </h3>
                                    )}
                                    <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-md mx-auto">
                                        {galleryData.cdPromo?.cds?.map((cd, index) => {
                                            const publicId = cd.image?.public_id;
                                            if (!publicId) return null;

                                            const cardContent = (
                                                <div className="group flex flex-col items-center">
                                                    <div
                                                        className="relative aspect-square w-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-2 sm:p-3 flex items-center justify-center"
                                                        style={{ backgroundColor: 'var(--surface)' }}
                                                    >
                                                        <div className="relative w-full h-full">
                                                            <CldImage
                                                                src={publicId}
                                                                alt={cd.title || `CD ${index + 1}`}
                                                                fill
                                                                className="object-contain transition-transform duration-500 group-hover:scale-105"
                                                                sizes="(max-width: 640px) 50vw, 250px"
                                                            />
                                                        </div>
                                                    </div>
                                                    {cd.title && (
                                                        <p className="mt-2.5 text-center text-sm font-medium text-(--text-secondary) group-hover:text-(--text-primary) transition-colors">
                                                            {cd.title}
                                                        </p>
                                                    )}
                                                </div>
                                            );

                                            return cd.link ? (
                                                <Link
                                                    key={cd._key || index}
                                                    href={cd.link}
                                                    target={cd.link.startsWith('http') ? '_blank' : undefined}
                                                    rel={cd.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                    className="block"
                                                >
                                                    {cardContent}
                                                </Link>
                                            ) : (
                                                <div key={cd._key || index}>
                                                    {cardContent}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <GalleryView data={galleryData} />

        </main>
    );
}
