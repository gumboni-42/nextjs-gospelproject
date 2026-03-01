import { client } from '@/sanity/client'
import { FooterContent, type FooterData } from './FooterContent'

const FOOTER_QUERY = `*[_type == "footerSettings"][0]{
  sponsors[]{ name, logo, url },
  mediaPartner{ name, logo, url },
  instagramUrl,
  youtubeUrl
}`

export async function Footer() {
    const data = await client.fetch<FooterData>(FOOTER_QUERY)
    return <FooterContent data={data} />
}
