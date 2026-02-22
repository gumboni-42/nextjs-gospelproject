'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MemberPasswordGate() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/member-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            const data = await res.json()

            if (data.success) {
                router.refresh()
            } else {
                setError(data.error || 'Falsches Passwort.')
                setPassword('')
            }
        } catch {
            setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/10 dark:bg-white/10 mb-4">
                        <svg className="w-8 h-8 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mitgliederbereich</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Dieser Bereich ist nur für Mitglieder zugänglich.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 space-y-5">
                    <div>
                        <label htmlFor="member-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Passwort
                        </label>
                        <input
                            id="member-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        style={{ backgroundColor: 'var(--gospel-primary)' }}
                    >
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Wird geprüft…
                            </span>
                        ) : 'Anmelden'}
                    </button>
                </form>
            </div>
        </main>
    )
}
