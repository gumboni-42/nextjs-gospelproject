"use client";

import Link from 'next/link';

interface NewsItem {
    _key?: string;
    text: string;
    internalLink?: string;
}

interface NewsBarProps {
    items: (string | NewsItem)[];
}

export function NewsBar({ items }: NewsBarProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="w-full bg-[color:var(--gospel-primary)] text-foreground overflow-hidden py-3">
            <div className="whitespace-nowrap flex gap-12 px-4 shadow-sm justify-center items-center">
                {items.map((item, index) => {
                    const text = typeof item === 'string' ? item : item.text;
                    const link = typeof item === 'string' ? null : item.internalLink;

                    if (!text) return null;

                    const content = (
                        <span className="text-lg font-semibold text-center text-foreground" aria-hidden="true">
                            {text}
                        </span>
                    );

                    return (
                        <span key={typeof item === 'string' ? index : item._key || index} className="inline-block mx-8 shrink-0">
                            {link ? (
                                <Link href={link} className="hover:underline decoration-white underline-offset-4">
                                    {content}
                                </Link>
                            ) : (
                                content
                            )}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
