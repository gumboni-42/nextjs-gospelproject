import { type SanityDocument } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { GalleryView } from "@/components/GalleryView";
import { HeroSection } from "@/components/HeroSection";
import { VideoGallery } from "@/components/VideoGallery";

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
    images: CloudinaryAsset[];
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    heroImage?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logo?: any;
}

const GALLERY_QUERY = `*[_type == "impressionenPage" && _id == "impressionenPage"][0]{
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

    return (
        <main className="min-h-screen">
            <HeroSection
                title={galleryData.title || 'Impressionen'}
                image={galleryData.heroImage}
                logo={galleryData.logo}
            />
            <VideoGallery videos={galleryData.videos} />
            <GalleryView data={galleryData} />

        </main>
    );
}
