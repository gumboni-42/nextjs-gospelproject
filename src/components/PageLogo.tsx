import Image from 'next/image';
import { getImageUrl } from '@/sanity/client';

export type PageLogoProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logo?: any;
    title?: string;
};

export const PageLogo = ({ logo, title }: PageLogoProps) => {
    const logoUrl = getImageUrl(logo);

    if (!logoUrl) {
        return null;
    }

    return (
        <div className="mb-8 flex justify-center">
            <Image
                src={logoUrl}
                alt={`${title || 'Page'} Logo`}
                width={250}
                height={250}
                className="object-contain"
            />
        </div>
    );
};
