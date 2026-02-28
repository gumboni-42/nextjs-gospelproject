"use client";

import { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Link from 'next/link';

interface SignupFormData {
    anrede: string;
    vorname: string;
    name: string;
    strasse: string;
    plz: string;
    ort: string;
    email: string;
    telefon: string;
    geburtsdatum: string;
    schonDabei: string;
    stimmlage: string;
    demoAufnahme: string;
    bedingungenAkzeptiert: boolean;
    mitteilung: string;
}

const initialFormData: SignupFormData = {
    anrede: '',
    vorname: '',
    name: '',
    strasse: '',
    plz: '',
    ort: '',
    email: '',
    telefon: '',
    geburtsdatum: '',
    schonDabei: '',
    stimmlage: '',
    demoAufnahme: '',
    bedingungenAkzeptiert: false,
    mitteilung: '',
};

export function SignupForm() {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [formData, setFormData] = useState<SignupFormData>(initialFormData);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.bedingungenAkzeptiert) {
            setErrorMessage('Bitte akzeptieren Sie die Teilnahmebedingungen.');
            return;
        }

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
                token = await executeRecaptcha!('signup');
            }

            // Format data explicitly for the API matching our App script
            const submitData = {
                token,
                anrede: formData.anrede,
                vorname: formData.vorname,
                name: formData.name,
                strasse: formData.strasse,
                plz: formData.plz,
                ort: formData.ort,
                email: formData.email,
                telefon: formData.telefon,
                geburtsdatum: formData.geburtsdatum,
                schonDabei: formData.schonDabei,
                stimmlage: formData.stimmlage,
                demoAufnahme: formData.demoAufnahme,
                mitteilung: formData.mitteilung
            };

            const response = await fetch('/api/signup', {
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
        } catch (error: any) {
            console.error('Signup submit error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Leider gab es ein Problem bei der Anmeldung. Bitte versuchen Sie es später noch einmal.');
        }
    };

    if (status === 'success') {
        return (
            <div className="mx-auto my-12">
                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-bold mb-4">Vielen Dank für Ihre Anmeldung!</h3>
                <p className="text-lg">Wir haben Ihre Daten erfolgreich erhalten und freuen uns, dass Sie beim nächsten Gospelproject dabei sind.</p>
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

            {/* Anrede */}
            <fieldset className="space-y-3">
                <legend className="text-sm font-semibold">Anrede *</legend>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="anrede" value="Frau" required
                            checked={formData.anrede === 'Frau'} onChange={handleChange}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <span className="text-gray-700">Frau</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="anrede" value="Herr" required
                            checked={formData.anrede === 'Herr'} onChange={handleChange}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <span className="text-gray-700">Herr</span>
                    </label>
                </div>
            </fieldset>

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
                <label htmlFor="strasse" className="block text-sm font-medium text-gray-300">Strasse und Nummer *</label>
                <input type="text" id="strasse" name="strasse" required value={formData.strasse} onChange={handleChange}
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

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">E-Mail-Adresse *</label>
                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="telefon" className="block text-sm font-medium text-gray-300">Telefonnummer (Mobile) *</label>
                    <input type="tel" id="telefon" name="telefon" required value={formData.telefon} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
                </div>
            </div>

            {/* Dob */}
            <div className="space-y-2">
                <label htmlFor="geburtsdatum" className="block text-sm font-medium text-gray-300">Geburtsdatum (Mindestalter 15 Jahre) *</label>
                <input type="date" id="geburtsdatum" name="geburtsdatum" required value={formData.geburtsdatum} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
            </div>

            {/* Experience */}
            <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-gray-300">Ich war schon dabei (optional)</legend>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="schonDabei" value="Ja"
                            checked={formData.schonDabei === 'Ja'} onChange={handleChange}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <span className="text-gray-700">Ja</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="schonDabei" value="Nein"
                            checked={formData.schonDabei === 'Nein'} onChange={handleChange}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <span className="text-gray-700">Nein</span>
                    </label>
                </div>
            </fieldset>

            {/* Vocal Range */}
            <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-gray-300">Stimmlage *</legend>
                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="stimmlage" value="Sopran" required
                            checked={formData.stimmlage === 'Sopran'} onChange={handleChange}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <span className="text-gray-300">Sopran (höhere Frauenstimmen)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="stimmlage" value="Alt" required
                            checked={formData.stimmlage === 'Alt'} onChange={handleChange}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <span className="text-gray-300">Alt (tiefere Frauenstimmen)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="stimmlage" value="Tenor" required
                            checked={formData.stimmlage === 'Tenor'} onChange={handleChange}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <span className="text-gray-300">Tenor (höhere Männerstimmen, auch tiefe Frauenstimmen)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="stimmlage" value="Bass" required
                            checked={formData.stimmlage === 'Bass'} onChange={handleChange}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <span className="text-gray-300">Bass (tiefere Männerstimmen)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="stimmlage" value="Bin mir nicht sicher" required
                            checked={formData.stimmlage === 'Bin mir nicht sicher'} onChange={handleChange}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <span className="text-gray-300">Bin mir nicht sicher</span>
                    </label>
                </div>
            </fieldset>

            {/* Demo Materials */}
            <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-gray-900">Demo Aufnahmen Songs *</legend>
                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="demoAufnahme" value="Mir reicht der Link zum MP3 Download" required
                            checked={formData.demoAufnahme === 'Mir reicht der Link zum MP3 Download'} onChange={handleChange}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <span className="text-gray-300">Mir reicht der Link zum MP3 Download</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="demoAufnahme" value="Ich wünsche zusätzlich zum MP3 Download auch eine Übungs-CD" required
                            checked={formData.demoAufnahme === 'Ich wünsche zusätzlich zum MP3 Download auch eine Übungs-CD'} onChange={handleChange}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <span className="text-gray-300">Ich wünsche zusätzlich zum MP3 Download auch eine Übungs-CD</span>
                    </label>
                </div>
            </fieldset>

            {/* Message */}
            <div className="space-y-2">
                <label htmlFor="mitteilung" className="block text-sm font-medium text-gray-300">Mitteilung (optional)</label>
                <textarea id="mitteilung" name="mitteilung" rows={4} value={formData.mitteilung} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-y" />
            </div>

            {/* Consent */}
            <div className="pt-4 border-t border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-6">
                        <input type="checkbox" name="bedingungenAkzeptiert" required
                            checked={formData.bedingungenAkzeptiert} onChange={handleChange}
                            className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                    </div>
                    <span className="text-sm text-gray-300 leading-relaxed group-hover:text-gray-900 transition-colors">
                        Mit dieser Anmeldung akzeptiere ich die <Link href="/gospelproject/teilnahmebedingungen" className="text-purple-600 underline hover:text-purple-700">Teilnahmebedingungen</Link> inklusive der <Link href="/datenschutz" className="text-purple-600 underline hover:text-purple-700">Datenschutzbestimmungen</Link> *
                    </span>
                </label>
            </div>

            {/* Errors */}
            {errorMessage && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                    {errorMessage}
                </div>
            )}

            {/* Submit */}
            <div className="pt-6">
                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full sm:w-auto px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-end gap-2"
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
                        "ZUM PROJEKT ANMELDEN"
                    )}
                </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-6">
                This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="https://policies.google.com/terms" className="underline" target="_blank" rel="noopener noreferrer">Terms of Service</a> apply.
            </p>
        </form>
    );
}
