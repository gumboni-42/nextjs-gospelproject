"use client";

import { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Link from 'next/link';

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

export function SignupFormGospelverein() {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [formData, setFormData] = useState<SignupFormData>(initialFormData);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

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
            setErrorMessage('reCAPTCHA ist noch nicht geladen. Bitte versuchen Sie es in wenigen Sekunden erneut.');
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
            setErrorMessage(error instanceof Error ? error.message : 'Leider gab es ein Problem bei der Anmeldung. Bitte versuchen Sie es später noch einmal.');
        }
    };

    if (status === 'success') {
        return (
            <div className="mx-auto my-12">
                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-bold mb-4">Vielen Dank für Ihre Gönnerschaft!</h3>
                <p className="text-lg">Wir haben Ihre Daten erfolgreich erhalten. Sie erhalten von uns in Kürze weitere Informationen.</p>
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
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 mt-12 mb-16">

            {/* Personal Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="vorname" className="block text-sm font-medium text-gray-300">Vorname *</label>
                    <input type="text" id="vorname" name="vorname" required value={formData.vorname} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name *</label>
                    <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
                </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-300">Adresse / Strasse und Nummer *</label>
                <input type="text" id="adresse" name="adresse" required value={formData.adresse} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2 sm:col-span-1">
                    <label htmlFor="plz" className="block text-sm font-medium text-gray-300">PLZ *</label>
                    <input type="text" id="plz" name="plz" required value={formData.plz} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="ort" className="block text-sm font-medium text-gray-300">Ort *</label>
                    <input type="text" id="ort" name="ort" required value={formData.ort} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
                </div>
            </div>

            {/* Dob */}
            <div className="space-y-2">
                <label htmlFor="geburtsdatum" className="block text-sm font-medium text-gray-300">Geburtstag *</label>
                <input type="date" id="geburtsdatum" name="geburtsdatum" required value={formData.geburtsdatum} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">E-Mail-Adresse *</label>
                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="telefon" className="block text-sm font-medium text-gray-300">Telefonnummer *</label>
                    <input type="tel" id="telefon" name="telefon" required value={formData.telefon} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
                </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
                <label htmlFor="mitteilung" className="block text-sm font-medium text-gray-300">Mitteilung (optional)</label>
                <textarea id="mitteilung" name="mitteilung" rows={4} value={formData.mitteilung} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-y" />
            </div>

            {/* Hinweis zum Datenschutz as a text note below, not a checkbox as per requirement */}
            <div className="text-sm text-gray-400">
                <p><strong>Hinweis zum Datenschutz:</strong> Wir verwenden deine Adressdaten ausschliesslich im Zusammenhang mit deiner Mitgliedschaft als Gönnerin oder Gönner. Für alle Fragen in Hinsicht auf Datenschutz oder einen Antrag auf komplette Löschung aller deiner personenbezogenen Daten kannst du dich jederzeit gerne an uns wenden: <a href="mailto:datenschutz@gospelverein.ch" className="underline hover:text-purple-400">datenschutz@gospelverein.ch</a></p>
                <p className="mt-2 text-xs">
                    Mit dem Absenden des Formulars akzeptierst du die <Link href="/datenschutz" className="underline hover:text-purple-400">Datenschutzbestimmungen</Link>.
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
                    className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 transition-colors rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {status === 'submitting' ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Wird gesendet...
                        </>
                    ) : (
                        "JETZT REGISTRIEREN"
                    )}
                </button>
            </div>

        </form>
    );
}
