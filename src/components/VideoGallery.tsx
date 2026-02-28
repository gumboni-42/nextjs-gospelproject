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
    thumbnail?: CloudinaryAsset;
}

interface VideoGalleryProps {
    videos?: VideoEntry[];
}

export const VideoGallery = ({ videos }: VideoGalleryProps) => {
    if (!videos || videos.length === 0) return null;

    return (
        <section className="py-16">
            <div className="container mx-auto">
                <h2 className="mb-12 text-center">Videos</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {videos.map((video) => (
                        <Link
                            key={video._key}
                            href={video.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                        >
                            <div className="relative aspect-video w-full bg-gray-900">
                                {video.thumbnail ? (
                                    <Image
                                        src={video.thumbnail.secure_url}
                                        alt={video.thumbnail.context?.custom?.alt || video.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                                        <span className="text-gray-500">No Thumbnail</span>
                                    </div>
                                )}

                                {/* Overlay & Play Icon */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                                        {/* Simple SVG Play Icon */}
                                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="py-4">
                                <p className="text-white line-clamp-2">
                                    {video.title}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
