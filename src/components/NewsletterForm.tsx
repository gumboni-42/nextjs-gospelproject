"use client";

import { useState } from "react";
import { SanityDocument } from "next-sanity";

interface NewsletterFormProps {
    initialPageData: SanityDocument | null;
}

export default function NewsletterForm({ initialPageData }: NewsletterFormProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            const response = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                setStatus("success");
                setMessage(initialPageData?.thankYouMessage || "Vielen Dank für deine Anmeldung!");
            } else {
                setStatus("error");
                setMessage(result.error || "Ein Fehler ist aufgetreten.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Ein unerwarteter Fehler ist aufgetreten.");
        }
    };

    if (status === "success") {
        return (
            <main className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
                <div className="max-w-2xl text-center bg-white/5 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl">
                    <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        Fast geschafft!
                    </h1>
                    <p className="text-gray-200 text-lg leading-relaxed">
                        {message}
                    </p>
                    <button
                        onClick={() => setStatus("idle")}
                        className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20"
                    >
                        Zurück
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center bg-[#050505]">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">
                        {initialPageData?.headerTitle || "Newsletter"}
                    </h1>
                    <p className="text-gray-400 text-lg">
                        {initialPageData?.description || "Bleib auf dem Laufenden – abonniere unseren Newsletter!"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 p-8 rounded-2xl border border-white/10 shadow-xl">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">Vorname</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="Dein Vorname"
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">Nachname</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="Dein Nachname"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">E-Mail-Adresse</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="deine@email.ch"
                        />
                    </div>

                    {status === "error" && (
                        <p className="text-red-400 text-sm mt-2 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {status === "loading" ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Wird angemeldet...
                            </span>
                        ) : (
                            "Jetzt abonnieren"
                        )}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-6">
                        Durch das Abonnieren erklärst du dich damit einverstanden, Gospelupdates zu erhalten. Wir versprechen, dass wir deine Daten nicht an Dritte weitergeben und du dich jederzeit abmelden kannst.
                    </p>
                </form>
            </div>
        </main>
    );
}
