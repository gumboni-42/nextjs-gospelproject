import { createClient } from "next-sanity";
import createImageUrlBuilder from '@sanity/image-url'

export const client = createClient({
    projectId: "jynb9blr",
    dataset: "production",
    apiVersion: "2024-01-01",
    useCdn: false,
});

const builder = createImageUrlBuilder(client)

export function urlFor(source: any) {
    return builder.image(source)
}