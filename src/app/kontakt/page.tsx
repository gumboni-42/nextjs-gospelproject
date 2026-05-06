import ContactForm from "@/components/ContactForm";
import { HeroSection } from "@/components/HeroSection";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";
import { sanityFetch } from "@/sanity/fetch";
import { type SanityDocument } from "next-sanity";
import { PageLogo } from "@/components/PageLogo";


const KONTAKT_QUERY = `*[_type == "kontaktPage"][0]{
  ...,
  "heroImage": heroImage,
  "logo": logo
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
                <div className="text-center mb-12">
                    <p>
                        Schreib uns direkt an <ObfuscatedEmail /> oder füll das untenstehende Formular aus 🙂
                    </p>
                </div>

                <div className="shadow-xl rounded-2xl overflow-hidden p-8 sm:p-12" style={{ backgroundColor: 'var(--surface)' }}>
                    <ContactForm />
                </div>
            </div>
        </main>
    );
}