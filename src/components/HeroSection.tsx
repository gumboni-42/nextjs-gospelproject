import Image from 'next/image';
import { urlFor } from '@/sanity/client';

export type HeroSectionProps = {
    title?: string;
    image?: any;
    logo?: any;
    size?: 'default' | 'large';
    overlay?: boolean;
};

export const HeroSection = ({ title, image, logo, size = 'default', overlay = true }: HeroSectionProps) => {
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

    const matchSize = !backgroundUrl ? 'h-[120px] min-h-0 pb-0 items-center' : (size === 'large' ? 'h-[60vh] md:h-[80vh] items-end pb-16 md:pb-24' : 'h-[45vh] min-h-[400px] items-end pb-16 md:pb-24');

    return (
        <section className={`relative w-full ${matchSize} flex justify-center overflow-hidden`}>
            {/* Background Image */}
            {backgroundUrl && (
                <div className="absolute inset-0 w-full h-full">
                    <Image
                        src={backgroundUrl}
                        alt={title || 'Hero Background'}
                        fill
                        className="object-cover object-center"
                        priority
                    />
                    {overlay && <div className="absolute inset-0 bg-black/30" />} {/* Subtle overlay */}
                </div>
            )}

            {/* Content */}
            {(title || logoUrl) && (
                <div className="relative z-10 container mx-auto px-4 text-center">
                    {logoUrl && (
                        <div className="mb-6 flex justify-center">
                            <Image
                                src={logoUrl}
                                alt={`${title || 'Hero'} Logo`}
                                width={250}
                                height={250}
                                className="object-contain"
                            />
                        </div>
                    )}
                    {title && (
                        <>
                            {logoUrl && <hr className="my-6 w-2/3 mx-auto" style={{ borderColor: 'var(--gospel-primary)' }} />}
                            <h1 className="text-4xl md:text-4xl text-white drop-shadow-lg">
                                {title}
                            </h1>
                        </>
                    )}
                </div>
            )}
        </section>
    );
};
