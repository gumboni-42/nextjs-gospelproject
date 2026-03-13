import { createClient } from "next-sanity";

export const client = createClient({
    projectId: "jynb9blr",
    dataset: "production",
    apiVersion: "2024-01-01",
    useCdn: false,
    stega: {
        studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "http://localhost:3333",
    },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getImageUrl(source: any) {
    if (!source) return null;
    return source.secure_url || null; // Cloudinary
}