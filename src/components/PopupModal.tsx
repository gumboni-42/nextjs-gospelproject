"use client";

import { useState, useEffect, useRef } from "react";
import CldImage from "@/components/CloudinaryImage";
import { PortableText } from "@/components/CustomPortableText";
import { getImageUrl } from "@/sanity/client";

export interface PopupModalProps {
    buttonText?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    text?: any;
}

export function PopupModal({ buttonText, image, text }: PopupModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    if (!buttonText || !text) return null;

    const imageUrl = getImageUrl(image);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Open Button */}
            <div className="flex justify-center mt-8 mb-12 w-full">
                <button
                    onClick={() => setIsOpen(true)}
                    className="inline-block px-8 py-4 text-white font-bold rounded-lg transition-transform hover:scale-105 shadow-lg hover:shadow-xl text-center cursor-pointer"
                    style={{ backgroundColor: 'var(--gospel-primary)' }}
                >
                    {buttonText}
                </button>
            </div>

            {/* Modal Backdrop and Box */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                    onClick={handleBackdropClick}
                >
                    <div
                        ref={modalRef}
                        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border-color)] shadow-2xl transition-all duration-300 flex flex-col max-h-[85vh]"
                        style={{
                            backgroundColor: 'color-mix(in srgb, var(--background) 90%, transparent)',
                            backdropFilter: 'blur(16px)',
                        }}
                    >
                        {/* Close button in top-right */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 z-10 p-2 text-[var(--text-muted)] hover:text-[var(--foreground)] bg-transparent hover:bg-[var(--surface-hover)] rounded-full transition-colors focus:outline-none cursor-pointer"
                            aria-label="Close modal"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        {/* Scrollable Content Container */}
                        <div className="overflow-y-auto w-full h-full p-6 md:p-8 space-y-6">
                            {/* Modal Image */}
                            {image?.public_id ? (
                                <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden flex-shrink-0">
                                    <CldImage
                                        src={image.public_id}
                                        alt={buttonText}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 600px"
                                    />
                                </div>
                            ) : imageUrl ? (
                                <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imageUrl}
                                        alt={buttonText}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : null}

                            {/* Modal Rich Text Content */}
                            <div className="prose max-w-none text-[var(--text-secondary)]">
                                <PortableText value={text} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
