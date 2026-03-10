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
    const isDraftMode = (await draftMode()).isEnabled

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
            revalidate: isDraftMode ? 0 : 3600, // 1 hour backup
            tags, // This connects the fetch to your webhook!
        },
    });
}