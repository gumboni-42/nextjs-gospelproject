import ContactForm from "@/components/ContactForm";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

export const metadata = {
    title: "Kontakt",
    description: "Nimm Kontakt mit dem Gospelproject auf – schreib uns eine Nachricht über das Kontaktformular oder per E-Mail.",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)' }}>
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg" style={{ color: 'var(--foreground)' }}>
                        Kontakt
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl" style={{ color: 'var(--text-muted)' }}>
                        Schreib uns direkt an <ObfuscatedEmail /> oder füll das untenstehende Formular aus 🙂
                    </p>
                </div>

                <div className="shadow-xl rounded-2xl overflow-hidden p-8 sm:p-12">
                    <ContactForm />
                </div>
            </div>
        </main>
    );
}