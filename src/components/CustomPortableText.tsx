import { PortableText as PortableTextOriginal, PortableTextProps } from 'next-sanity';
import ObfuscatedContact from './ObfuscatedContact';

const ptComponents = {
    marks: {
        link: ({ children, value }: any) => {
            const href: string = value.href || '';

            // Obfuscate mailto: links to protect email addresses from crawlers
            if (href.startsWith('mailto:')) {
                const email = href.replace('mailto:', '');
                return (
                    <ObfuscatedContact type="email" value={email}>
                        {children}
                    </ObfuscatedContact>
                );
            }

            // Obfuscate tel: links to protect phone numbers from crawlers
            if (href.startsWith('tel:')) {
                const phone = href.replace('tel:', '');
                return (
                    <ObfuscatedContact type="phone" value={phone}>
                        {children}
                    </ObfuscatedContact>
                );
            }

            const rel = !href.startsWith('/') ? 'noreferrer noopener' : undefined;
            const target = value.blank ? '_blank' : undefined;
            return (
                <a href={href} rel={rel} target={target}>
                    {children}
                </a>
            );
        },
    },
};

export function PortableText(props: PortableTextProps) {
    return <PortableTextOriginal {...props} components={ptComponents} />;
}

