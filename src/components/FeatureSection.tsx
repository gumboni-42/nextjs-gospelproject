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
        <div className="flex flex-col items-center justify-center p-8 text-center h-full border border-gray-100 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {title}
                </h3>
            )}
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-md leading-relaxed">
                {text}
            </p>
            <Link
                href={linkUrl}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
                {linkText}
            </Link>
        </div>
    );
}
