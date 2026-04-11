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
        <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--background)' }}>
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--surface)' }}>
                        <svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Mitgliederbereich</h1>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        Dieser Bereich ist nur für Mitglieder zugänglich.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl shadow-xl p-8 space-y-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)' }}>
                    <div>
                        <label htmlFor="member-password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
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
                            className="w-full px-4 py-3 rounded-lg border placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-color)', color: 'var(--foreground)' }}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full py-3 px-4 bg-primary hover:bg-primary-hover rounded-xl font-semibold text-white shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
