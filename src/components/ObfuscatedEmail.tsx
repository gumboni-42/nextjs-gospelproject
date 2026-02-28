"use client";

import { useState, useEffect } from "react";

export default function ObfuscatedEmail() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsClient(true);
    }, []);

    const user = "info";
    const domain = "gospelproject.ch";

    if (!isClient) {
        return <span>{user} [at] {domain}</span>;
    }

    return (
        <a href={`mailto:${user}@${domain}`}>{`${user}@${domain}`}</a>
    );
}
