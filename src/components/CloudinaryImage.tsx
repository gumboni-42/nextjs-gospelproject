"use client";
 
import { CldImage, CldImageProps } from 'next-cloudinary';
import { stegaClean } from 'next-sanity';
import { useTheme } from './ThemeProvider';

interface CloudinaryImageProps extends CldImageProps {
    invertInDarkMode?: boolean;
}

export default function CloudinaryImage(props: CloudinaryImageProps) {
    const { invertInDarkMode, effects, ...rest } = props;
    const { theme } = useTheme();

    // Clean any sanity stega encoding from the public_id to prevent broken URLs
    const cleanSrc = typeof props.src === 'string' ? stegaClean(props.src) : props.src;

    const finalEffects = effects ? [...(effects as any[])] : [];
    if (invertInDarkMode && theme === 'dark') {
        finalEffects.push({ negate: true });
    }

    return <CldImage {...rest} src={cleanSrc} effects={finalEffects} />;
}
