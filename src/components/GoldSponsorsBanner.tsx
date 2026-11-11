import CldImage from '@/components/CloudinaryImage';
import { getImageUrl } from '@/sanity/client';

export interface GoldSponsor {
    _key?: string;
    name: string;
    logo?: { public_id?: string; secure_url?: string };
    url?: string;
}

/**
 * Transparent banner listing all Goldsponsoren (from the sponsorenPage document)
 * horizontally, each logo linked to the sponsor's website.
 */
export function GoldSponsorsBanner({ sponsors, label = 'Goldsponsoren' }: { sponsors?: GoldSponsor[]; label?: string }) {
    if (!sponsors || sponsors.length === 0) return null;

    return (
        <section aria-label={label} className="w-full bg-transparent">
            {/* Same width constraints as the feature sections above (container + max-w-6xl) */}
            <div className="container mx-auto px-4 pb-8">
                <div className="w-full max-w-6xl mx-auto px-8 flex flex-col items-start gap-2">
                    <ul className="w-full flex flex-wrap items-center justify-between gap-6">
                        {sponsors.map((sponsor, i) => {
                            const fallbackSrc = !sponsor.logo?.public_id ? getImageUrl(sponsor.logo) : null;
                            const content = sponsor.logo?.public_id ? (
                                <CldImage
                                    src={sponsor.logo.public_id}
                                    alt={sponsor.name}
                                    width={240}
                                    height={160}
                                    crop="fit"
                                    className="h-15 w-[100px] mx-2 object-contain rounded-md"
                                />
                            ) : fallbackSrc ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={fallbackSrc}
                                    alt={sponsor.name}
                                    className="h-15 w-[100px] mx-2 object-contain rounded-md"
                                />
                            ) : (
                                <span className="text-black font-semibold bg-white px-3 h-15 w-[100px] flex text-[10px] leading-tight items-center justify-center text-center">
                                    {sponsor.name}
                                </span>
                            );

                            return (
                                <li key={sponsor._key ?? i}>
                                    {sponsor.url ? (
                                        <a
                                            href={sponsor.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={sponsor.name}
                                            className="rounded-md hover:opacity-80 transition-opacity block overflow-hidden"
                                            style={{ backgroundColor: 'var(--partner-logo-bg)' }}
                                        >
                                            {content}
                                        </a>
                                    ) : (
                                        <div
                                            title={sponsor.name}
                                            className="rounded-md block overflow-hidden"
                                            style={{ backgroundColor: 'var(--partner-logo-bg)' }}
                                        >
                                            {content}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                    <span className="text-[9px] text-white/40 uppercase tracking-tight">{label}</span>
                </div>
            </div>
        </section>
    );
}

