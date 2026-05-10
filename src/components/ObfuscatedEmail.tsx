"use client";

import ObfuscatedContact from "./ObfuscatedContact";

export default function ObfuscatedEmail({ user = "info", domain = "gospelproject.ch" }: { user?: string; domain?: string }) {
    return <ObfuscatedContact type="email" value={`${user}@${domain}`} />;
}
