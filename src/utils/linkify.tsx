import React from 'react';
import ObfuscatedContact from '@/components/ObfuscatedContact';

export function linkify(text: string) {
    if (!text) return text;
    
    // Regex for matching URLs and Emails
    const combinedRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)|(https?:\/\/[^\s]+)/gi;
    
    const parts = [];
    let lastIndex = 0;
    
    let match;
    while ((match = combinedRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }
        
        const emailMatch = match[1];
        const urlMatch = match[2];
        
        if (emailMatch) {
            parts.push(
                <ObfuscatedContact key={match.index} type="email" value={emailMatch} className="underline hover:text-primary-hover" />
            );
        } else if (urlMatch) {
            parts.push(
                <a key={match.index} href={urlMatch} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-hover">
                    {urlMatch}
                </a>
            );
        }
        
        lastIndex = combinedRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
}

