import { createClient } from "next-sanity";
import createImageUrlBuilder from '@sanity/image-url'

export const client = createClient({
    projectId: "jynb9blr",
    dataset: "production",
    apiVersion: "2024-01-01",
    useCdn: false,
    stega: {
        studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "http://localhost:3333",
    },
});

const builder = createImageUrlBuilder(client)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
    return builder.image(source)
}