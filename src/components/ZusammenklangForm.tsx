"use client";

import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const SPONSOR_TYPES = [
    "Hauptsponsor",
    "Gold-Sponsor",
    "Silber-Sponsor",
    "Bronze-Sponsor",
    "Spender",
];

const PUBLIKATION_PROGRAMMHEFT = [
    "Gerne als Spender/Sponsor aufführen (Verdankung im Programmheft)",
    "Entsprechend dem Beitrag gerne Logo/Inserat im Programmheft platzieren",
    "Verzicht auf Platzierung von Logo/Inserat im Programmheft",
    "Stiller Beitrag, bitte nicht als Spende/Sponsoring erwähnen",
];

const PUBLIKATION_WEBSITE = [
    "Entsprechend dem Beitrag gerne Name/Logo auf Homepage publizieren",
    "Verzicht auf Platzierung von Name/Logo auf Homepage",
];

const LOGO_INSERAT = [
    "wird per E-Mail zugestellt",
    "wird auf Datenträger per Post geschickt",
    "nicht notwendig bzw. Verzicht auf Platzierung",
    "Vorlage von letztem Mal verwenden",
];

interface ZusammenklangFormProps {
    introText?: string;
}

export default function ZusammenklangForm({ introText }: ZusammenklangFormProps) {
    const [formData, setFormData] = useState({
        sponsorType: "",
        firmaName: "",
        kontaktperson: "",
        adresse: "",
        plz: "",
        ort: "",
        telefon: "",
        email: "",
        beitrag: "",
        publikationProgrammheft: "",
        publikationWebsite: "",
        auffuehrenAls: "",
        logoInserat: "",
        mitteilung: "",
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

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
                captchaValue = await executeRecaptcha!("zusammenklang_form");
            }

            const res = await fetch("/api/zusammenklang", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, captcha: captchaValue, formSubject: `Neue Sponsoringanfrage: ${formData.firmaName}` }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Something went wrong.");

            setStatus("success");
            setFormData({
                sponsorType: "",
                firmaName: "",
                kontaktperson: "",
                adresse: "",
                plz: "",
                ort: "",
                telefon: "",
                email: "",
                beitrag: "",
                publikationProgrammheft: "",
                publikationWebsite: "",
                auffuehrenAls: "",
                logoInserat: "",
                mitteilung: "",
            });
        } catch (error: unknown) {
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : String(error));
        }
    };

    const labelClasses = "block text-sm font-medium text-[var(--text-secondary)] mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
            {/* Sponsor Type */}
            <fieldset>
                <legend className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                    {introText || "Gerne unterstützen wir das Gospeln 2026 und investieren als:"}
                </legend>
                <div className="space-y-2">
                    {SPONSOR_TYPES.map((type) => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="sponsorType"
                                value={type}
                                checked={formData.sponsorType === type}
                                onChange={handleChange}
                                className="text-primary focus:ring-primary"
                                required
                            />
                            <span className="text-sm text-[var(--text-secondary)]">{type}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            {/* Text Fields */}
            <div>
                <label htmlFor="zk-firmaName" className={labelClasses}>Firma / Name *</label>
                <input type="text" id="zk-firmaName" name="firmaName" required value={formData.firmaName} onChange={handleChange} className="" />
            </div>

            <div>
                <label htmlFor="zk-kontaktperson" className={labelClasses}>Kontaktperson</label>
                <input type="text" id="zk-kontaktperson" name="kontaktperson" value={formData.kontaktperson} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="zk-adresse" className={labelClasses}>Adresse</label>
                <input type="text" id="zk-adresse" name="adresse" value={formData.adresse} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="zk-plz" className={labelClasses}>PLZ</label>
                    <input type="text" id="zk-plz" name="plz" value={formData.plz} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="zk-ort" className={labelClasses}>Ort</label>
                    <input type="text" id="zk-ort" name="ort" value={formData.ort} onChange={handleChange} />
                </div>
            </div>

            <div>
                <label htmlFor="zk-telefon" className={labelClasses}>Telefon</label>
                <input type="tel" id="zk-telefon" name="telefon" value={formData.telefon} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="zk-email" className={labelClasses}>E-Mail-Adresse *</label>
                <input type="email" id="zk-email" name="email" required value={formData.email} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="zk-beitrag" className={labelClasses}>Beitrag CHF</label>
                <input type="text" id="zk-beitrag" name="beitrag" value={formData.beitrag} onChange={handleChange} />
            </div>

            {/* Publikation Programmheft */}
            <fieldset>
                <legend className="text-sm font-medium text-[var(--text-secondary)] mb-3">Publikation im Programmheft</legend>
                <div className="space-y-2">
                    {PUBLIKATION_PROGRAMMHEFT.map((option) => (
                        <label key={option} className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="publikationProgrammheft"
                                value={option}
                                checked={formData.publikationProgrammheft === option}
                                onChange={handleChange}
                                className="text-primary focus:ring-primary mt-0.5"
                            />
                            <span className="text-sm text-[var(--text-secondary)]">{option}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            {/* Publikation Website */}
            <fieldset>
                <legend className="text-sm font-medium text-[var(--text-secondary)] mb-3">Publikation auf der Website</legend>
                <div className="space-y-2">
                    {PUBLIKATION_WEBSITE.map((option) => (
                        <label key={option} className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="publikationWebsite"
                                value={option}
                                checked={formData.publikationWebsite === option}
                                onChange={handleChange}
                                className="text-primary focus:ring-primary mt-0.5"
                            />
                            <span className="text-sm text-[var(--text-secondary)]">{option}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            {/* Aufführen als */}
            <div>
                <label htmlFor="zk-auffuehrenAls" className={labelClasses}>Als Spender oder Sponsor so aufführen (z.B. Sponsor GmbH Rüti)</label>
                <input type="text" id="zk-auffuehrenAls" name="auffuehrenAls" value={formData.auffuehrenAls} onChange={handleChange} />
            </div>

            {/* Logo / Inserat */}
            <fieldset>
                <legend className="text-sm font-medium text-[var(--text-secondary)] mb-3">Logo / Inserat</legend>
                <div className="space-y-2">
                    {LOGO_INSERAT.map((option) => (
                        <label key={option} className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="logoInserat"
                                value={option}
                                checked={formData.logoInserat === option}
                                onChange={handleChange}
                                className="text-primary focus:ring-primary mt-0.5"
                            />
                            <span className="text-sm text-[var(--text-secondary)]">{option}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            {/* Mitteilung */}
            <div>
                <label htmlFor="zk-mitteilung" className={labelClasses}>Mitteilung</label>
                <textarea id="zk-mitteilung" name="mitteilung" rows={4} value={formData.mitteilung} onChange={handleChange} />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-auto py-2.5 px-6 cursor-pointer justify-end text-center bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {status === "loading" ? "Wird gesendet …" : "Anmeldung absenden"}
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
                                Vielen Dank für Ihre Anmeldung! Wir melden uns bald.
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
                                {errorMessage || "Anmeldung konnte nicht versendet werden. Bitte versuche es erneut."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
