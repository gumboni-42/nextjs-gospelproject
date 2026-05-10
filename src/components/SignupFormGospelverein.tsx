"use client";

import { useState, useRef, useEffect } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Link from 'next/link';
import { linkify } from '@/utils/linkify';
import ObfuscatedContact from '@/components/ObfuscatedContact';

interface SignupFormData {
    vorname: string;
    name: string;
    adresse: string;
    plz: string;
    ort: string;
    geburtsdatum: string;
    telefon: string;
    email: string;
    mitteilung: string;
}

const initialFormData: SignupFormData = {
    vorname: '',
    name: '',
    adresse: '',
    plz: '',
    ort: '',
    geburtsdatum: '',
    telefon: '',
    email: '',
    mitteilung: '',
};

export function SignupFormGospelverein({ successTitle, successText }: { successTitle?: string; successText?: string }) {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const containerRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState<SignupFormData>(initialFormData);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (status === 'success' && containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [status]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setStatus('submitting');
        setErrorMessage('');

        if (!executeRecaptcha && process.env.NODE_ENV === 'production') {
            setStatus('error');
            setErrorMessage('reCAPTCHA ist noch nicht geladen. Bitte versuche es in wenigen Sekunden erneut.');
            return;
        }

        try {
            let token = 'development-bypass';
            if (process.env.NODE_ENV === 'production') {
                token = await executeRecaptcha!('signup_gospelverein');
            }

            // We will point to a new API endpoint or standard API endpoint later
            const submitData = {
                token,
                formType: 'gospelverein_goenner',
                formSubject: `Neue Gönneranmeldung: ${formData.vorname} ${formData.name}`,
                ...formData
            };

            // Assuming a generic submission endpoint or a specific one we will build later
            // For now, let's keep it similar to the existing signup flow.
            const response = await fetch('/api/signup-gospelverein', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ein Fehler ist aufgetreten.');
            }

            setStatus('success');
            setFormData(initialFormData);
        } catch (error: unknown) {
            console.error('Signup submit error:', error);
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Leider gab es ein Problem bei der Anmeldung. Bitte versuche es später noch einmal.');
        }
    };

    if (status === 'success') {
        return (
            <div ref={containerRef} className="mx-auto my-12 text-center scroll-mt-24">
                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-bold mb-4">{successTitle || "Herzlichen Dank für deine Gönnerschaft und willkommen in unserem Trägerkreis!"}</h3>
                <p className="text-lg">
                    {successText 
                        ? linkify(successText) 
                        : linkify("Du erhältst in Kürze eine Bestätigung und weitere Infos per E-Mail. Sollte diese ausbleiben, melde dich gerne an info@gospelverein.ch")
                    }
                </p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-8 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    Weitere Anmeldung durchführen
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 mt-8">

            {/* Personal Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="vorname" className="block text-sm font-medium text-[var(--text-secondary)]">Vorname *</label>
                    <input type="text" id="vorname" name="vorname" required value={formData.vorname} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)]">Name *</label>
                    <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} />
                </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
                <label htmlFor="adresse" className="block text-sm font-medium text-[var(--text-secondary)]">Adresse / Strasse und Nummer *</label>
                <input type="text" id="adresse" name="adresse" required value={formData.adresse} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2 sm:col-span-1">
                    <label htmlFor="plz" className="block text-sm font-medium text-[var(--text-secondary)]">PLZ *</label>
                    <input type="text" id="plz" name="plz" required value={formData.plz} onChange={handleChange} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="ort" className="block text-sm font-medium text-[var(--text-secondary)]">Ort *</label>
                    <input type="text" id="ort" name="ort" required value={formData.ort} onChange={handleChange} />
                </div>
            </div>

            {/* Dob */}
            <div className="space-y-2">
                <label htmlFor="geburtsdatum" className="block text-sm font-medium text-[var(--text-secondary)]">Geburtstag *</label>
                <input type="date" id="geburtsdatum" name="geburtsdatum" required value={formData.geburtsdatum} onChange={handleChange} />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)]">E-Mail-Adresse *</label>
                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <label htmlFor="telefon" className="block text-sm font-medium text-[var(--text-secondary)]">Telefonnummer *</label>
                    <input type="tel" id="telefon" name="telefon" required value={formData.telefon} onChange={handleChange} />
                </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
                <label htmlFor="mitteilung" className="block text-sm font-medium text-[var(--text-secondary)]">Mitteilung (optional)</label>
                <textarea id="mitteilung" name="mitteilung" rows={4} value={formData.mitteilung} onChange={handleChange} />
            </div>

            {/* Hinweis zum Datenschutz as a text note below, not a checkbox as per requirement */}
            <div className="text-sm text-(--text-secondary)">
                <p><strong>Hinweis zum Datenschutz:</strong> Wir verwenden deine Adressdaten ausschliesslich im Zusammenhang mit deiner Mitgliedschaft als Gönnerin oder Gönner. Für alle Fragen in Hinsicht auf Datenschutz oder einen Antrag auf komplette Löschung aller deiner personenbezogenen Daten kannst du dich jederzeit gerne an uns wenden: <ObfuscatedContact type="email" value="datenschutz@gospelverein.ch" className="underline hover:text-primary-hover" /></p>
                <p className="mt-2 text-xs">
                    Mit dem Absenden des Formulars akzeptierst du die <Link href="/datenschutz" className="underline hover:text-primary-hover">Datenschutzbestimmungen</Link>.
                </p>
            </div>

            {/* Errors */}
            {errorMessage && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                    {errorMessage}
                </div>
            )}

            {/* Submit */}
            <div className="pt-6 flex justify-end">
                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-auto py-2.5 px-6 cursor-pointer justify-end text-center bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {status === 'submitting' ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Wird gesendet …
                        </>
                    ) : (
                        "Jetzt Gönner werden"
                    )}
                </button>
            </div>

        </form>
    );
}
