import { client } from '@/sanity/client'
import { FooterContent, type FooterData } from './FooterContent'

const FOOTER_QUERY = `{
  "footer": *[_type == "footerSettings"][0]{
    sponsors[]{ name, logo, url },
    mediaPartner{ name, logo, url },
    instagramUrl,
    youtubeUrl,
    spotifyUrl,
    appleMusicUrl
  },
  "memberPageVisible": *[_type == "gospelprojectMemberPage"][0].visible
}`

export async function Footer() {
  const result = await client.fetch<{ footer: FooterData; memberPageVisible: boolean | null }>(
    FOOTER_QUERY,
    {},
    {
      next: {
        revalidate: 3600,
        tags: ['footerSettings', 'gospelprojectMemberPage'],
      },
    }
  )
  return <FooterContent data={result?.footer} memberPageVisible={result?.memberPageVisible === true} />
}
