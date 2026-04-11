import Link from 'next/link'

export default function NotFound() {
    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <p
                    className="text-8xl font-black mb-4"
                    style={{ color: 'var(--gospel-primary)' }}
                >
                    404
                </p>
                <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                    Seite nicht gefunden
                </h1>
                <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
                    Die gesuchte Seite existiert leider nicht oder wurde verschoben.
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                    style={{ backgroundColor: 'var(--gospel-primary)' }}
                >
                    Zurück zur Startseite
                </Link>
            </div>
        </main>
    )
}
