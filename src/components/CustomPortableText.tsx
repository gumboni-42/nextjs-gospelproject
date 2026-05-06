import { PortableText as PortableTextOriginal, PortableTextProps } from 'next-sanity';

const ptComponents = {
    marks: {
        link: ({ children, value }: any) => {
            const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
            const target = value.blank ? '_blank' : undefined;
            return (
                <a href={value.href} rel={rel} target={target}>
                    {children}
                </a>
            );
        },
    },
};

export function PortableText(props: PortableTextProps) {
    return <PortableTextOriginal {...props} components={ptComponents} />;
}
