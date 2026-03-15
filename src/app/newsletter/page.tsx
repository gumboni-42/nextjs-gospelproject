import { sanityFetch } from "@/sanity/fetch";
import { SanityDocument } from "next-sanity";
import NewsletterForm from "@/components/NewsletterForm";

const NEWSLETTER_QUERY = `*[_type == "newsletterPage"][0]`;

export default async function NewsletterPage() {
    const pageData = await sanityFetch<SanityDocument>({
        query: NEWSLETTER_QUERY,
        tags: ['newsletterPage']
    });

    return <NewsletterForm initialPageData={pageData} />;
}

