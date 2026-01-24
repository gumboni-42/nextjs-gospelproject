import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/sanity/client';

interface FeatureSectionProps {
    title?: string;
    logo?: any;
    text?: string;
    linkUrl: string;
    linkText: string;
    reverse?: boolean; // Optional, if we want to alternate alignment slightly
}

export function FeatureSection({ title, logo, text, linkUrl, linkText }: FeatureSectionProps) {
    return (
        <div className="flex flex-col p-8 h-full">
            {logo && (
                <div className="mb-6 relative w-48 h-48">
                    <Image
                        src={urlFor(logo).width(400).url()}
                        alt="Logo"
                        fill
                        className="object-contain"
                    />
                </div>
            )}
            {title && (
                <h3 className="text-2xl font-bold mb-4">
                    {title}
                </h3>
            )}
            <p className="text-lg mb-8 max-w-md leading-relaxed">
                {text}
            </p>
            <Link
                href={linkUrl}
                className=""
            >
                {linkText}
            </Link>
        </div>
    );
}
