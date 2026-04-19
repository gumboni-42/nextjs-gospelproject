import Image from 'next/image';
import Link from 'next/link';

interface CloudinaryAsset {
    _key: string;
    secure_url: string;
    public_id: string;
    context?: {
        custom?: {
            alt?: string;
        }
    }
}

interface VideoEntry {
    _key: string;
    title: string;
    youtubeUrl: string;
    isPublic?: boolean;
    thumbnail?: CloudinaryAsset;
}

interface VideoGalleryProps {
    videos?: VideoEntry[];
}

/**
 * Extract YouTube video ID from various URL formats.
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
function getYouTubeVideoId(url: string): string | null {
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes('youtu.be')) {
            return parsed.pathname.slice(1);
        }
        if (parsed.hostname.includes('youtube.com')) {
            if (parsed.pathname.startsWith('/embed/')) {
                return parsed.pathname.split('/embed/')[1];
            }
            return parsed.searchParams.get('v');
        }
    } catch {
        // invalid URL
    }
    return null;
}

function getThumbnailUrl(video: VideoEntry): string | null {
    if (video.thumbnail?.secure_url) return video.thumbnail.secure_url;

    const videoId = getYouTubeVideoId(video.youtubeUrl);
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return null;
}

export const VideoGallery = ({ videos }: VideoGalleryProps) => {
    // Filter to only public videos (treat undefined/missing isPublic as public for backwards compat)
    const publicVideos = videos?.filter((v) => v.isPublic !== false);
    if (!publicVideos || publicVideos.length === 0) return null;

    return (
        <section className="py-16">
            <div className="container mx-auto">
                <h2 className="mb-12 text-center">Videos</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {publicVideos.map((video) => {
                        const thumbnailUrl = getThumbnailUrl(video);
                        const altText = video.thumbnail?.context?.custom?.alt || video.title;

                        return (
                            <Link
                                key={video._key}
                                href={video.youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative block overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative aspect-video w-full" style={{ backgroundColor: 'var(--surface)' }}>
                                    {thumbnailUrl ? (
                                        <Image
                                            src={thumbnailUrl}
                                            alt={altText}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
                                            <span className="text-(--text-secondary)">No Thumbnail</span>
                                        </div>
                                    )}

                                    {/* Overlay & Play Icon */}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                        <div
                                            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110"
                                            style={{ backgroundColor: 'var(--gospel-primary)' }}
                                        >
                                            {/* Simple SVG Play Icon */}
                                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="py-4">
                                    <p className="line-clamp-2" style={{ color: 'var(--foreground)' }}>
                                        {video.title}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
