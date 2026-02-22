import Link from 'next/link'
import { client } from '@/sanity/client'
import { CldImage } from 'next-cloudinary'

const FOOTER_QUERY = `*[_type == "footerSettings"][0]{
  sponsors[]{ name, logo, url },
  mediaPartner{ name, logo, url },
  instagramUrl,
  youtubeUrl
}`

interface Sponsor {
    name: string
    logo?: { public_id: string }
    url?: string
}

interface FooterData {
    sponsors?: Sponsor[]
    mediaPartner?: Sponsor
    instagramUrl?: string
    youtubeUrl?: string
}

function InstagramIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
    )
}

function YouTubeIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    )
}

export async function Footer() {
    const data = await client.fetch<FooterData>(FOOTER_QUERY)

    return (
        <footer className="bg-black mt-auto flex flex-col md:relative md:min-h-[25vw] md:justify-end">

            {/* Background image — stacks above content on mobile, fills footer on desktop */}
            <div className="w-full md:absolute md:inset-0 pointer-events-none">
                <img
                    src="/footer-lines.png"
                    alt=""
                    className="w-full object-cover md:h-full"
                    style={{ aspectRatio: '4/1' }}
                />
            </div>

            {/* Footer content — sits on top of image on desktop */}
            <div className="relative z-10">

                {/* Sponsors & Partners */}
                {(data?.sponsors?.length || data?.mediaPartner) && (
                    <div className="container mx-auto px-6 py-10">
                        <div className="flex flex-wrap items-center justify-center gap-12">
                            {data?.sponsors && data.sponsors.length > 0 && (
                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Hauptsponsoren</p>
                                    <div className="flex flex-wrap items-center gap-8">
                                        {data.sponsors.map((sponsor, i) => (
                                            <a
                                                key={i}
                                                href={sponsor.url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="opacity-70 hover:opacity-100 transition-opacity"
                                                title={sponsor.name}
                                            >
                                                {sponsor.logo?.public_id ? (
                                                    <CldImage
                                                        src={sponsor.logo.public_id}
                                                        alt={sponsor.name}
                                                        width={140}
                                                        height={56}
                                                        crop="fit"
                                                        className="h-12 w-auto object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-white font-semibold">{sponsor.name}</span>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data?.mediaPartner && (
                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Medienpartner</p>
                                    <a
                                        href={data.mediaPartner.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="opacity-70 hover:opacity-100 transition-opacity"
                                        title={data.mediaPartner.name}
                                    >
                                        {data.mediaPartner.logo?.public_id ? (
                                            <CldImage
                                                src={data.mediaPartner.logo.public_id}
                                                alt={data.mediaPartner.name}
                                                width={140}
                                                height={56}
                                                crop="fit"
                                                className="h-12 w-auto object-contain"
                                            />
                                        ) : (
                                            <span className="text-white font-semibold">{data.mediaPartner.name}</span>
                                        )}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Bottom bar */}
                <div className="border-t border-white/10">
                    <div className="container mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">

                        {/* Social icons */}
                        <div className="flex items-center gap-4">
                            {data?.instagramUrl && (
                                <a
                                    href={data.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <InstagramIcon />
                                </a>
                            )}
                            {data?.youtubeUrl && (
                                <a
                                    href={data.youtubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="YouTube"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <YouTubeIcon />
                                </a>
                            )}
                        </div>

                        {/* Legal, Newsletter & Copyright */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
                            <Link
                                href="/newsletter"
                                className="hover:text-white transition-colors font-medium"
                                style={{ color: 'var(--gospel-primary)' }}
                            >
                                Newsletter abonnieren
                            </Link>
                            <Link href="/datenschutz" className="hover:text-white transition-colors">
                                Datenschutz
                            </Link>
                            <Link href="/impressum" className="hover:text-white transition-colors">
                                Impressum
                            </Link>
                            <span style={{ color: 'var(--foreground)' }}>
                                © {new Date().getFullYear()} Gospelproject
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </footer>

    )
}
