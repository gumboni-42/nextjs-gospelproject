import type { MetadataRoute } from 'next'

const SITE_URL = process.env.SITE_URL || 'https://www.gospelproject.ch'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: '/api/',
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    }
}
