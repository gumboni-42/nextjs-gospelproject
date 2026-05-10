import ContactForm from "@/components/ContactForm";
import { HeroSection } from "@/components/HeroSection";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";
import { sanityFetch } from "@/sanity/fetch";
import { type SanityDocument } from "next-sanity";
import { PortableText } from "@/components/CustomPortableText";
import BannerNewsletter from "@/components/BannerNewsletter";

const KONTAKT_QUERY = `*[_type == "kontaktPage"][0]{
  ...,
  "heroImage": heroImage,
  "contactText": contactText,
}`;

export const metadata = {
    title: "Kontakt",
    description: "Nimm Kontakt mit dem Gospelproject auf – schreib uns eine Nachricht über das Kontaktformular oder per E-Mail.",
};

export default async function ContactPage() {
    const data = await sanityFetch<SanityDocument>({ query: KONTAKT_QUERY, tags: ['kontaktPage'] });

    if (!data) return null;

    return (
        <main className="min-h-screen">
            <HeroSection
                title={data.title || "Kontakt"}
                image={data.heroImage}
            />
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <p>
                            Schreib uns direkt an <ObfuscatedEmail /> oder füll das untenstehende Formular aus 🙂
                        </p>
                    </div>

                    <div className="rounded-2xl overflow-hidden p-8 sm:p-12" style={{ backgroundColor: 'var(--surface)' }}>
                        <ContactForm />
                    </div>

                    {data.contactText && (
                        <div className="mt-16 text-center">
                            <PortableText value={data.contactText} />
                        </div>
                    )}
                </div>
            </div>
            
            <BannerNewsletter />
        </main>
    );
}