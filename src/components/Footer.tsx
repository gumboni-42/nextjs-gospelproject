import { client } from '@/sanity/client'
import { FooterContent, type FooterData } from './FooterContent'

const FOOTER_QUERY = `*[_type == "footerSettings"][0]{
  sponsors[]{ name, logo, url },
  mediaPartner{ name, logo, url },
  instagramUrl,
  youtubeUrl,
  spotifyUrl,
  appleMusicUrl
}`

export async function Footer() {
  const data = await client.fetch<FooterData>(FOOTER_QUERY, {}, {
    next: {
      revalidate: 3600,
      tags: ['footerSettings'],
    },
  })
  return <FooterContent data={data} />
}
