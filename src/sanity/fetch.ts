
export async function sanityFetch<QueryResponse>({
    query,
    params = {},
    tags = [], // You pass the tags here
}: {
    query: string;
    params?: QueryParams;
    tags?: string[];
}) {
    return client.fetch<QueryResponse>(query, params, {
        next: {
            revalidate: 3600, // 1 hour backup
            tags, // This connects the fetch to your webhook!
        },
    });
}