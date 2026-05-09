"use client"

import Link from 'next/link';
import Image from 'next/image';
import CldImage from '@/components/CloudinaryImage';


export interface Sponsor {
    name: string
    logo?: { public_id: string; secure_url?: string }
    url?: string
}

export interface FooterData {
    sponsors?: Sponsor[]
    mediaPartner?: Sponsor
    instagramUrl?: string
    youtubeUrl?: string
    spotifyUrl?: string
    appleMusicUrl?: string
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

function FacebookIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
    )
}

function SpotifyIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.66.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.781-.18-.6.18-1.2.78-1.381 4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.419 1.56-.299.54-1.019.72-1.559.42z" />
        </svg>
    )
}

function AppleMusicIcon() {
    return (
        <svg viewBox="0 0 250 250" fill="currentColor" className="w-6 h-6" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M212.797.045c-.873.082-8.629 1.48-9.562 1.674L95.883 23.757l-.04.01c-2.8.602-4.996 1.613-6.692 3.063-2.047 1.745-3.18 4.215-3.612 7.094-.09.612-.24 1.858-.24 3.695v136.699c0 3.195-.252 6.298-2.379 8.942s-4.755 3.44-7.835 4.073l-7.013 1.439c-8.87 1.817-14.638 3.052-19.865 5.114-4.997 1.97-8.74 4.481-11.719 7.666-5.91 6.298-8.307 14.842-7.484 22.844.702 6.829 3.722 13.362 8.909 18.19 3.501 3.267 7.876 5.747 13.033 6.798 5.347 1.093 11.046.715 19.373-1 4.435-.908 8.588-2.327 12.541-4.706a31.7 31.7 0 0 0 9.883-9.299c2.628-3.828 4.324-8.084 5.257-12.606.963-4.665 1.194-8.881 1.194-13.535V89.678c0-6.35 1.766-8.024 6.802-9.27 0 0 89.233-18.312 93.397-19.138 5.809-1.133 8.548.55 8.548 6.747v80.935c0 3.206-.03 6.452-2.177 9.106-2.127 2.643-4.756 3.439-7.836 4.072l-7.013 1.44c-8.869 1.817-14.638 3.052-19.865 5.114-4.997 1.97-8.739 4.481-11.719 7.665-5.909 6.298-8.518 14.842-7.695 22.845.702 6.829 3.933 13.362 9.12 18.19a26.9 26.9 0 0 0 13.033 6.737c5.347 1.092 11.046.704 19.373-1.001 4.435-.908 8.589-2.266 12.541-4.644a31.7 31.7 0 0 0 9.883-9.299c2.629-3.828 4.324-8.084 5.257-12.606.963-4.665 1.003-8.881 1.003-13.536V9.701c.021-6.288-3.24-10.166-9.049-9.656" />
        </svg>
    )
}

export function FooterContent({ data }: { data: FooterData }) {
    return (
        <footer className="bg-(--var(--background)) mt-auto flex flex-col relative overflow-hidden md:min-h-[25vw] md:justify-end">

            {/* Background image — fills footer completely */}
            <div className="absolute inset-0 w-full pointer-events-none">
                <Image
                    src="/footer-lines.png"
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover"
                />
            </div>

            {/* Footer content — sits on top of image */}
            <div className="relative z-10">

                {/* Sponsors & Partners */}
                {(data?.sponsors?.length || data?.mediaPartner) && (
                    <div className="container mx-auto px-6 py-2">
                        <div className="flex flex-wrap items-left justify-left gap-12">
                            {data?.sponsors && data.sponsors.length > 0 && (
                                <div className="flex flex-col items-left gap-4">
                                    <div className="flex flex-wrap items-center gap-8">
                                        {data.sponsors.map((sponsor, i) => (
                                            <div key={i} className="flex flex-col items-leftcenter gap-1">
                                                <a
                                                    href={sponsor.url || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-md opacity-100 hover:opacity-80 transition-opacity block overflow-hidden"
                                                    style={{ backgroundColor: 'var(--partner-logo-bg)' }}
                                                    title={sponsor.name}
                                                >
                                                    {sponsor.logo?.public_id ? (
                                                        <CldImage
                                                            src={sponsor.logo.public_id}
                                                            alt={sponsor.name}
                                                            width={240}
                                                            height={160}
                                                            crop="fit"
                                                            className="h-15 w-[100px] mx-2 object-contain rounded-md"
                                                        />
                                                    ) : (
                                                        <span className="text-black font-semibold bg-white px-3 block h-20 w-[100px] mx-4 flex text-xs items-center justify-center text-center">{sponsor.name}</span>
                                                    )}
                                                </a>
                                                <span className="text-[9px] text-white/40 text-left uppercase tracking-tight">Hauptsponsor</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data?.mediaPartner && (
                                <div className="flex flex-col items-left gap-4">
                                    <div className="flex flex-wrap items-left gap-8">
                                        <div className="flex flex-col items-left gap-1">
                                            <a
                                                href={data.mediaPartner.url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-md opacity-100 hover:opacity-80 transition-opacity block overflow-hidden"
                                                style={{ backgroundColor: 'var(--partner-logo-bg)' }}
                                                title={data.mediaPartner.name}
                                            >
                                                {data.mediaPartner.logo?.public_id ? (
                                                    <CldImage
                                                        src={data.mediaPartner.logo.public_id}
                                                        alt={data.mediaPartner.name}
                                                        width={240}
                                                        height={120}
                                                        crop="fit"
                                                        className="h-15 w-[120px] object-contain rounded-md"
                                                    />
                                                ) : (
                                                    <span className="text-black font-semibold bg-white px-3 block h-20 w-[120px] flex text-xs items-center justify-center text-center">{data.mediaPartner.name}</span>
                                                )}
                                            </a>
                                            <span className="text-[9px] text-white/50 uppercase tracking-tight">Medienpartner</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Bottom bar */}
                <div className="border-t border-white/10">
                    <div className="container mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">

                        {/* Social & Music icons */}
                        <div className="flex items-center gap-4">
                            <a
                                href={data?.instagramUrl || "https://www.instagram.com/gospelproject_zo/"}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="text-white hover:text-[var(--gospel-primary)] transition-colors"
                            >
                                <InstagramIcon />
                            </a>
                            <a
                                href={data?.youtubeUrl || "https://www.youtube.com/@gospelprojectch"}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="YouTube"
                                className="text-white hover:text-[var(--gospel-primary)] transition-colors"
                            >
                                <YouTubeIcon />
                            </a>
                            <a
                                href="https://facebook.com/gospelprojectch"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="text-white hover:text-[var(--gospel-primary)] transition-colors"
                            >
                                <FacebookIcon />
                            </a>

                            {/* Separator Pipe */}
                            <div className="w-px h-5 bg-white/20 ml-2 mr-2"></div>

                            {/* Music links */}
                            {data?.spotifyUrl && (
                                <a
                                    href={data.spotifyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Spotify"
                                    className="text-white hover:text-[var(--gospel-primary)] transition-colors"
                                >
                                    <SpotifyIcon />
                                </a>
                            )}
                            {data?.appleMusicUrl && (
                                <a
                                    href={data.appleMusicUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Apple Music"
                                    className="text-white hover:text-[var(--gospel-primary)] transition-colors"
                                >
                                    <AppleMusicIcon />
                                </a>
                            )}
                        </div>

                        {/* Legal, Newsletter & Copyright */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-(--text-secondary)">
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
                                © {new Date().getFullYear()} Gospelverein
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    )
}
