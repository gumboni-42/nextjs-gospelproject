"use client";

import { useState, useEffect } from "react";

interface ObfuscatedContactProps {
    type: 'email' | 'phone';
    value: string;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Client-side only contact rendering to protect email addresses and phone numbers
 * from being scraped by crawlers. On the server, the real contact info is hidden
 * or obfuscated. After client-side hydration, the full clickable link is revealed.
 */
export default function ObfuscatedContact({ type, value, className, children }: ObfuscatedContactProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsClient(true);
    }, []);

    if (type === 'email') {
        const atIndex = value.indexOf('@');
        const user = atIndex > -1 ? value.substring(0, atIndex) : value;
        const domain = atIndex > -1 ? value.substring(atIndex + 1) : '';

        if (!isClient) {
            // Server/crawler sees obfuscated text — no mailto:, no @ symbol
            return <span className={className}>{children || `${user} [at] ${domain}`}</span>;
        }

        return (
            <a href={`mailto:${user}@${domain}`} className={className}>
                {children || `${user}@${domain}`}
            </a>
        );
    }

    // Phone type
    const cleanNumber = value.replace(/[^\d+]/g, '');

    if (!isClient) {
        // Server/crawler sees partial number or custom children text
        return (
            <span className={className}>
                {children || `${value.substring(0, Math.ceil(value.length * 0.6))}…`}
            </span>
        );
    }

    return (
        <a href={`tel:${cleanNumber}`} className={className}>
            {children || value}
        </a>
    );
}
