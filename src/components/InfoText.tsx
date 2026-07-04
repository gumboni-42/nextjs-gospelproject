type InfoTextProps = {
    children: React.ReactNode;
    className?: string;
    /** Hide the banner after this point in time. Accepts a Date object or any
     *  string understood by `new Date()` (e.g. "2026-07-06T20:00:00+02:00"). */
    hideAfter?: Date | string;
};

export const InfoText = ({ children, className = '', hideAfter }: InfoTextProps) => {
    if (hideAfter && new Date() > new Date(hideAfter)) {
        return null;
    }

    return (
        <div
            className={`rounded-lg px-4 py-3 text-sm ${className}`}
            style={{
                backgroundColor: 'var(--info-text-bg)',
                border: '1px solid color-mix(in srgb, var(--gospel-primary) 50%, transparent)',
                color: 'var(--foreground)',
            }}
        >
            {children}
        </div>
    );
};
