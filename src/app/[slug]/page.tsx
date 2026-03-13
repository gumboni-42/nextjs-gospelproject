import { PortableText, type SanityDocument } from "next-sanity";
import { getImageUrl } from "@/sanity/client";
import { sanityFetch } from "@/sanity/fetch";
import Link from "next/link";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;


export default async function PostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await sanityFetch<SanityDocument>({ query: POST_QUERY, params: { slug }, tags: ['post'] });
    const postImageUrl = post.image
        ? getImageUrl(post.image)
        : null;

    return (
        <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
            <Link href="/" className="hover:underline">
                ← Back to posts
            </Link>
            {postImageUrl && (
                <img
                    src={postImageUrl}
                    alt={post.title}
                    className="aspect-video rounded-xl"
                    width="550"
                    height="310"
                />
            )}
            <h1 className="text-4xl font-bold mb-8">{post.title}</h1>
            <div className="prose">
                <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
                {Array.isArray(post.body) && <PortableText value={post.body} />}
            </div>
        </main>
    );
}