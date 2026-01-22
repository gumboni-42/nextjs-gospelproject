import Image from 'next/image';
import { urlFor } from '@/sanity/client';

interface HeroProps {
    image: any;
}

export function Hero({ image }: HeroProps) {
    if (!image) return null;

    return (
        <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
            <Image
                src={urlFor(image).width(1920).height(1080).url()}
                alt="Hero Image"
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay */}
        </div>
    );
}
