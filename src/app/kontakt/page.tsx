import ContactForm from "@/components/ContactForm";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

export const metadata = {
    title: "Kontakt | Gospelproject",
    description: "Get in touch with us.",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                        Kontakt
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
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