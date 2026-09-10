import { type QueryParams } from "next-sanity";
import { client } from "@/sanity/client";
import { draftMode } from "next/headers";

export async function sanityFetch<QueryResponse>({
    query,
    params = {},
    tags = [], // You pass the tags here
}: {
    query: string;
    params?: QueryParams;
    tags?: string[];
}) {
    // Await draftMode but catch errors thrown during static prerender in Next 15+
    let isDraftMode = false;
    try {
        isDraftMode = (await draftMode()).isEnabled;
    } catch {
        isDraftMode = false;
    }

    if (isDraftMode && !process.env.SANITY_API_READ_TOKEN) {
        throw new Error("The `SANITY_API_READ_TOKEN` environment variable is required.");
    }

    return client.fetch<QueryResponse>(query, params, {
        ...(isDraftMode && {
            token: process.env.SANITY_API_READ_TOKEN,
            perspective: "previewDrafts",
            stega: true,
        }),
        next: {
            revalidate: (isDraftMode || process.env.NODE_ENV === 'development') ? 0 : 3600, // Fresh data in dev/draft, 1 hour backup in prod
            tags, // This connects the fetch to your webhook!
        },
    });
}