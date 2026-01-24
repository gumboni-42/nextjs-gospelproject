import Image from 'next/image';
import { urlFor } from '@/sanity/client';

export type HeroSectionProps = {
    title: string;
    image?: any;
    logo?: any;
};

export const HeroSection = ({ title, image, logo }: HeroSectionProps) => {
    return (
        <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            {image && (
                <div className="absolute inset-0 w-full h-full">
                    <Image
                        src={urlFor(image).url()}
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
                {logo && (
                    <div className="mb-6 flex justify-center">
                        <Image
                            src={urlFor(logo).url()}
                            alt={`${title} Logo`}
                            width={150}
                            height={150}
                            className="object-contain"
                        />
                    </div>
                )}
                <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                    {title}
                </h1>
            </div>
        </section>
    );
};
