"use client";
 
import { CldImage, CldImageProps } from 'next-cloudinary';
import { stegaClean } from 'next-sanity';
import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';

interface CloudinaryImageProps extends CldImageProps {
    invertInDarkMode?: boolean;
}

export default function CloudinaryImage(props: CloudinaryImageProps) {
    const { invertInDarkMode, effects, src, onError, ...rest } = props;
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Clean any sanity stega encoding and whitespace from the public_id to prevent broken URLs
    const cleanSrc = typeof src === 'string' ? stegaClean(src).trim() : src;

    // Build the effects array safely
    const finalEffects = Array.isArray(effects) ? [...effects] : [];
    
    // Only apply theme-based effects after mounting to ensure consistency with the client theme
    if (mounted && invertInDarkMode && theme === 'dark') {
        finalEffects.push({ negate: true });
    }

    if (!cleanSrc || hasError) return null;

    return (
        <CldImage 
            {...rest} 
            src={cleanSrc} 
            {...(finalEffects.length > 0 ? { effects: finalEffects } : {})}
            onError={(e) => {
                console.warn(`[CloudinaryImage] Failed to load image "${cleanSrc}" — check that this asset exists in Cloudinary.`);
                setHasError(true);
                onError?.(e);
            }}
        />
    );
}
