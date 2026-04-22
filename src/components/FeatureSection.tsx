import Link from 'next/link';
import { getImageUrl } from '@/sanity/client';

interface FeatureSectionProps {
    title?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logo?: any;
    text?: string;
    linkUrl: string;
    linkText: string;
    reverse?: boolean; // Optional, if we want to alternate alignment slightly
}

export function FeatureSection({ title, logo, text, linkUrl, linkText }: FeatureSectionProps) {

    const logoUrl = getImageUrl(logo);

    return (
        <div className="flex flex-col p-8 h-full">
            {logoUrl && (
                <div className="h-20 mb-3 w-full flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={logoUrl}
                        alt={title || "Logo"}
                        className="w-[21rem] max-w-full h-full object-contain object-center"
                    />
                </div>
            )}
            {!logoUrl && title && (
                <h3 className="text-2xl font-bold mb-4">
                    {title}
                </h3>
            )}
            <p className="text-lg mb-8 max-w-md leading-relaxed">
                {text}
            </p>
            <Link
                href={linkUrl}
                className="text-[var(--gospel-contrast)] hover:text-[var(--gospel-hover)] hover:underline transition-colors"
            >
                {linkText}
            </Link>
        </div>
    );
}
