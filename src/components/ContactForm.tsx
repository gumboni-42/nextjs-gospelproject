"use client";

import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export default function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // Use the v3 hook
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        if (!executeRecaptcha && process.env.NODE_ENV === 'production') {
            setStatus("error");
            setErrorMessage("Recaptcha not ready. Please try again in a moment.");
            return;
        }

        try {
            let captchaValue = 'development-bypass';
            if (process.env.NODE_ENV === 'production') {
                // Execute v3 recaptcha with action "contact_form"
                captchaValue = await executeRecaptcha!("contact_form");
            }

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    message,
                    captcha: captchaValue,
                    formSubject: `Nachricht von Kontaktformular: ${name}`,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong.");
            }

            setStatus("success");
            setName("");
            setEmail("");
            setMessage("");
        } catch (error: unknown) {
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : String(error));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
            <div>
                <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Name
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="block w-full rounded-md shadow-sm focus:border-primary focus:ring-2 focus:ring-primary sm:text-sm p-3 border"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)', color: 'var(--foreground)' }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    E-Mail
                </label>
                <div className="mt-1">
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="block w-full rounded-md shadow-sm focus:border-primary focus:ring-2 focus:ring-primary sm:text-sm p-3 border"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)', color: 'var(--foreground)' }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Nachricht
                </label>
                <div className="mt-1">
                    <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        className="block w-full rounded-md shadow-sm focus:border-primary focus:ring-2 focus:ring-primary sm:text-sm p-3 border"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)', color: 'var(--foreground)' }}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-auto py-2.5 px-6 cursor-pointer justify-end text-center bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {status === "loading" ? "Schicke …" : "Nachricht schicken"}
                </button>
            </div>

            {status === "success" && (
                <div className="rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-600">
                                Message sent successfully! We&apos;ll get back to you soon.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {status === "error" && (
                <div className="rounded-md p-4" style={{ backgroundColor: 'var(--surface)' }}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-500">
                                {errorMessage || "Failed to send message. Please try again."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
