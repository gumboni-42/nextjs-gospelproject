import Image from 'next/image';
import { urlFor } from '@/sanity/client';

export type HeroSectionProps = {
    title: string;
    image?: any;
    logo?: any;
};

export const HeroSection = ({ title, image, logo }: HeroSectionProps) => {
    // Helper to get URL from either Sanity image or Cloudinary asset
    const getImageUrl = (source: any) => {
        if (!source) return null;
        if (source.secure_url) return source.secure_url; // Cloudinary
        try {
            return urlFor(source).url(); // Sanity
        } catch (e) {
            console.error("Error generating image URL:", e);
            return null;
        }
    };

    const backgroundUrl = getImageUrl(image);
    const logoUrl = getImageUrl(logo);

    return (
        <section className="relative w-full h-[45vh] min-h-[400px] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            {backgroundUrl && (
                <div className="absolute inset-0 w-full h-full">
                    <Image
                        src={backgroundUrl}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                {logoUrl && (
                    <div className="mb-6 flex justify-center">
                        <Image
                            src={logoUrl}
                            alt={`${title} Logo`}
                            width={250}
                            height={250}
                            className="object-contain"
                        />
                    </div>
                )}
                <hr className="my-6 w-2/3 mx-auto border-gray-200" />
                <h1 className="text-4xl md:text-4xl text-white drop-shadow-lg">
                    {title}
                </h1>
            </div>
        </section>
    );
};
