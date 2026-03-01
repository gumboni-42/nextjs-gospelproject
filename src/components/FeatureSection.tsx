import Link from 'next/link';
import { urlFor } from '@/sanity/client';

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
    // Helper to get URL from either Sanity image or Cloudinary asset
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getImageUrl = (source: any) => {
        if (!source) return null;
        if (source.secure_url) return source.secure_url; // Cloudinary
        try {
            return urlFor(source).width(400).url(); // Sanity fallback
        } catch (e) {
            console.error("Error generating image URL:", e);
            return null;
        }
    };

    const logoUrl = getImageUrl(logo);

    return (
        <div className="flex flex-col p-8 h-full">
            {logoUrl && (
                <div className="h-32 mb-6 w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={logoUrl}
                        alt={title || "Logo"}
                        className="w-[21rem] max-w-full h-full object-contain object-left"
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
                className=""
            >
                {linkText}
            </Link>
        </div>
    );
}
