"use client";

import { CldImage, CldImageProps } from 'next-cloudinary';
import { stegaClean } from 'next-sanity';

export default function CloudinaryImage(props: CldImageProps) {
    // Clean any sanity stega encoding from the public_id to prevent broken URLs
    const cleanSrc = typeof props.src === 'string' ? stegaClean(props.src) : props.src;
    return <CldImage {...props} src={cleanSrc} />;
}
