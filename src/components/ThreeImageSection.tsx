"use client";

import { CldImage } from 'next-cloudinary';

interface CloudinaryAsset {
    public_id: string;
    version: number;
    format: string;
    resource_type: string;
    type: string;
}

interface ThreeImageSectionProps {
    value: {
        title?: string;
        images?: CloudinaryAsset[];
    };
}

export function ThreeImageSection({ value }: ThreeImageSectionProps) {
    const { title, images } = value;

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <section className="my-12">
            {title && (
                <h3 className="text-xl font-bold text-center mb-8">{title}</h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {images.map((image, index) => (
                    <div key={image.public_id || index} className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                        <CldImage
                            src={image.public_id}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
