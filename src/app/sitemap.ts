import type { MetadataRoute } from 'next'
import { client } from '@/sanity/client'

const SITE_URL = process.env.SITE_URL || 'https://www.gospelproject.ch'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static routes with priorities
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
        { url: `${SITE_URL}/gospelproject`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
        { url: `${SITE_URL}/gospelation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
        { url: `${SITE_URL}/agenda`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${SITE_URL}/gospelverein`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${SITE_URL}/sponsoring`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${SITE_URL}/kontakt`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
        { url: `${SITE_URL}/zusammenklang`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${SITE_URL}/newsletter`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
        { url: `${SITE_URL}/impressionen`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        // Gospelproject subpages
        { url: `${SITE_URL}/gospelproject/mitmachen`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${SITE_URL}/gospelproject/anmeldung`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${SITE_URL}/gospelproject/termine`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${SITE_URL}/gospelproject/team`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },

        { url: `${SITE_URL}/gospelproject/teilnahmebedingungen`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        // Gospelation subpages
        { url: `${SITE_URL}/gospelation/engagieren`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        // Legal
        { url: `${SITE_URL}/impressum`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
        { url: `${SITE_URL}/datenschutz`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    ]

    // Dynamic blog post routes from Sanity
    let postRoutes: MetadataRoute.Sitemap = []
    try {
        const posts = await client.fetch<Array<{ slug: string; _updatedAt: string }>>(
            `*[_type == "post" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
        )
        postRoutes = posts.map((post) => ({
            url: `${SITE_URL}/${post.slug}`,
            lastModified: new Date(post._updatedAt),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        }))
    } catch {
        // Silently skip if Sanity query fails
    }

    return [...staticRoutes, ...postRoutes]
}
