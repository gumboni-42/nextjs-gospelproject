import Image from 'next/image';
import { getImageUrl } from '@/sanity/client';
import { Amatic_SC } from 'next/font/google';

const amaticSC = Amatic_SC({
    subsets: ['latin'],
    weight: ['400', '700'],
});

export type HeroSectionProps = {
    title?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image?: any;
    size?: 'default' | 'large';
    overlay?: boolean;
};

export const HeroSection = ({ title, image, size = 'default', overlay = true }: HeroSectionProps) => {

    const backgroundUrl = getImageUrl(image);

    const matchSize = !backgroundUrl ? 'h-auto min-h-0 pb-8 pt-48 items-center' : (size === 'large' ? 'h-[60vh] md:h-[80vh] items-end pb-8' : 'h-[45vh] min-h-[400px] items-end pb-8');

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
                        sizes="100vw"
                    />
                    {overlay && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />} {/* Gradient overlay for contrast */}
                </div>
            )}

            {/* Content */}
            {title && (
                <div className={`relative z-10 container mx-auto mb-8 px-4 text-center`}>
                    <h1 className={`${amaticSC.className} text-6xl md:text-8xl text-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]`}>
                        {title}
                    </h1>
                </div>
            )}
        </section>
    );
};
