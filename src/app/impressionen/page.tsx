import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { GalleryView } from "@/components/GalleryView";
import { HeroSection } from "@/components/HeroSection";

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
    title?: string;
    heroImage?: any;
    logo?: any;
}

const GALLERY_QUERY = `*[_type == "gallery"][0]{
  ...,
  years[]{
    ...,
    images[]{
      ...,
      "secure_url": secure_url,
      "public_id": public_id,
      "context": context
    }
  }
}`;

const options = { next: { revalidate: 60 } };

export const metadata = {
    title: "Impressionen - Gospel Project",
    description: "Bildergalerie des Gospel Project.",
};

export default async function ImpressionenPage() {
    const galleryData = await client.fetch<GalleryDocument>(GALLERY_QUERY, {}, options);

    if (!galleryData) {
        return (
            <main className="container mx-auto min-h-screen px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Impressionen</h1>
                <p className="text-gray-600">No gallery found. Please create a "Gallery" document in Sanity.</p>
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
            {/* <div className="bg-purple-900 text-white py-16 text-center">
                <h1 className="text-5xl font-bold mb-4">{galleryData.title || 'Impressionen'}</h1>
                <p className="text-purple-200 text-lg max-w-2xl mx-auto">
                    Einblick in unsere vergangenen Konzerte und Projekte.
                </p>
            </div> */}

            <GalleryView data={galleryData} />
        </main>
    );
}
