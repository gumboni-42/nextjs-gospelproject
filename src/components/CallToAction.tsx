import Link from "next/link";

export type CallToActionData = {
    text?: string;
    linkType?: 'internal' | 'external';
    internalLink?: string;
    url?: string;
};

export const CallToAction = ({ data }: { data?: CallToActionData }) => {
    if (!data) return null;

    const hasInternalLink = data.linkType === 'internal' && data.internalLink;
    const hasExternalLink = data.linkType === 'external' && data.url;

    if (!hasInternalLink && !hasExternalLink) return null;

    const href = data.linkType === 'internal' ? data.internalLink! : data.url!;
    const text = data.text || 'Learn More';

    return (
        <div className="flex justify-center mt-8 w-full">
            <Link
                href={href}
                className="inline-block px-8 py-4 text-white font-bold rounded-lg transition-transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
                style={{ backgroundColor: 'var(--gospel-primary)' }}
            >
                {text}
            </Link>
        </div>
    );
};
