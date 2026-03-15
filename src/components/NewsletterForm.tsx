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
                    <h1 className="text-xl font-bold mb-6">
                        Du bist angemeldet
                    </h1>
                    <p className="text-gray-200 text-lg leading-relaxed">
                        {message}
                    </p>
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
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                            {initialPageData?.vornameLabel || "Vorname"}
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder={initialPageData?.vornameLabel || "Dein Vorname"}
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                            {initialPageData?.nachnameLabel || "Nachname"}
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder={initialPageData?.nachnameLabel || "Dein Nachname"}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                            {initialPageData?.emailLabel || "E-Mail-Adresse"}
                        </label>
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
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-auto py-2 px-4 cursor-pointer justify-end text-center bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
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
                                initialPageData?.buttonText || "Jetzt abonnieren"
                            )}
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-6">
                        {initialPageData?.footerText || "Durch das Abonnieren erklärst du dich damit einverstanden, Gospelupdates zu erhalten. Wir versprechen, dass wir deine Daten nicht an Dritte weitergeben und du dich jederzeit abmelden kannst."}
                    </p>
                </form>
            </div>
        </main>
    );
}
