export const metadata = {
    title: "Newsletter | Gospelproject",
    description: "Newsletter des Gospelproject abonnieren",
};

export default function NewsletterPage() {
    return (
        <main className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
            <div className="max-w-xl text-center">
                <h1 className="text-4xl font-bold mb-4">Newsletter</h1>
                <p className="text-gray-400 text-lg mb-8">
                    Bleib auf dem Laufenden – Newsletter-Anmeldung kommt bald!
                </p>
                <p className="text-sm text-gray-500">
                    In der Zwischenzeit erreichst du uns unter{" "}
                    <a href="mailto:info@gospelproject.ch" className="underline">
                        info@gospelproject.ch
                    </a>
                </p>
            </div>
        </main>
    );
}
