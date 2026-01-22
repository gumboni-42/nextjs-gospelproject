"use client";

import { useState, useMemo, useEffect } from 'react';
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

interface YearEntry {
    _key: string;
    year: string;
    images: CloudinaryAsset[];
}

interface GalleryViewProps {
    data: {
        years?: YearEntry[];
    };
}

export function GalleryView({ data }: GalleryViewProps) {
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const getLightboxUrl = (url: string) => {
        return url.replace('/upload/', '/upload/w_1200,h_900,c_limit/');
    };

    const sortedYears = useMemo(() => {
        if (!data?.years) return [];
        return [...data.years].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.year.localeCompare(b.year);
            } else {
                return b.year.localeCompare(a.year);
            }
        });
    }, [data, sortOrder]);

    // Flatten images with year info for the lightbox
    const allImages = useMemo(() => {
        return sortedYears.flatMap(yearEntry =>
            (yearEntry.images || []).map(image => ({
                asset: image,
                year: yearEntry.year
            }))
        );
    }, [sortedYears]);

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedIndex(prev => {
            if (prev === null) return null;
            return (prev + 1) % allImages.length;
        });
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedIndex(prev => {
            if (prev === null) return null;
            return (prev - 1 + allImages.length) % allImages.length;
        });
    };

    // Keyboard navigation
    useEffect(() => {
        if (selectedIndex === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') setSelectedIndex(null);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, allImages.length]); // Dependencies needed to access up-to-date state if closures were stale (though setSelectedIndex functional update handles value)

    const scrollToYear = (year: string) => {
        const element = document.getElementById(`year-${year}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (!data?.years || data.years.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500">
                <p>No images found in the gallery.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Sticky Navigation & Controls */}
            <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 dark:bg-black/90 dark:border-white/10 py-4">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Year Links */}
                    <div className="flex flex-wrap items-center gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0 scrollbar-hide">
                        {sortedYears.map((entry) => (
                            <button
                                key={entry._key}
                                onClick={() => scrollToYear(entry.year)}
                                className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 dark:bg-white/10 hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/40 dark:hover:text-purple-400 transition-colors whitespace-nowrap"
                            >
                                {entry.year}
                            </button>
                        ))}
                    </div>

                    {/* Sort Toggle */}
                    <button
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                        </svg>
                        {sortOrder === 'desc' ? 'Latest First' : 'Oldest First'}
                    </button>
                </div>
            </div>

            {/* Gallery Content */}
            <div className="container mx-auto px-4 py-8">
                {sortedYears.map((entry) => (
                    <div key={entry._key} id={`year-${entry.year}`} className="mb-20 scroll-mt-32">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                {entry.year}
                            </h2>
                            <div className="h-px bg-gray-200 dark:bg-white/10 flex-grow"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {entry.images?.map((image) => (
                                <div
                                    key={image.public_id}
                                    className="relative aspect-[4/3] group overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5 cursor-pointer"
                                    onClick={() => {
                                        const index = allImages.findIndex(img => img.asset.public_id === image.public_id);
                                        setSelectedIndex(index);
                                    }}
                                >
                                    <img
                                        src={image.secure_url}
                                        alt={image.context?.custom?.alt || `Gallery image ${entry.year}`}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
                                </div>
                            ))}
                        </div>
                        {(!entry.images || entry.images.length === 0) && (
                            <p className="text-gray-500 italic">No images for this year.</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {selectedIndex !== null && allImages[selectedIndex] && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
                    onClick={() => setSelectedIndex(null)}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedIndex(null)}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Year Label */}
                    <div className="absolute top-4 left-4 z-50">
                        <span className="text-white font-bold text-xl bg-black/50 px-3 py-1 rounded-full border border-white/20">
                            {allImages[selectedIndex].year}
                        </span>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-50 p-2 hover:bg-white/10 rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-50 p-2 hover:bg-white/10 rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>

                    <div
                        className="relative max-w-6xl max-h-screen w-full h-full flex items-center justify-center p-2"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image area
                    >
                        <img
                            key={allImages[selectedIndex].asset.public_id} // Key to force re-render/animation if desired, or at least update src
                            src={getLightboxUrl(allImages[selectedIndex].asset.secure_url)}
                            alt={allImages[selectedIndex].asset.context?.custom?.alt || "Gallery Image"}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
