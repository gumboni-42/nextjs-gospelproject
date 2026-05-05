import { getImageUrl } from '@/sanity/client';
import CldImage from '@/components/CloudinaryImage';

export type PageLogoProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logo?: any;
    title?: string;
    show?: boolean;
};

export const PageLogo = ({ logo, title, show = true }: PageLogoProps) => {
    const logoUrl = getImageUrl(logo);

    if (!logoUrl || !show) {
        return null;
    }

    return (
        <div className="mb-8 flex justify-center">
            {logo?.public_id ? (
                <CldImage
                    src={logo.public_id}
                    alt={`${title || 'Page'} Logo`}
                    width={250}
                    height={250}
                    crop="limit"
                    className="object-contain"
                />
            ) : logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    src={logoUrl}
                    alt={`${title || 'Page'} Logo`}
                    width={250}
                    height={250}
                    className="object-contain"
                />
            ) : null}
        </div>
    );
};
