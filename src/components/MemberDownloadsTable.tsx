import React from 'react';

export interface MemberDownloadItem {
    _key?: string;
    title: string;
    description?: string;
    isNew?: boolean;
    fileUrl?: string;
    fileSize?: number;
    originalFilename?: string;
    fileExtension?: string;
    mimeType?: string;
    uploadedAt?: string;
    externalUrl?: string;
    customFilename?: string;
    customFilesize?: string;
    customUploadDate?: string;
}

interface MemberDownloadsTableProps {
    items?: MemberDownloadItem[];
    sectionTitle?: string;
    sectionDescription?: string;
}

function formatFileSize(bytes?: number, customSize?: string): string {
    if (customSize && customSize.trim() !== '') {
        return customSize.trim();
    }
    if (typeof bytes !== 'number' || isNaN(bytes) || bytes <= 0) {
        return '–';
    }
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatUploadDate(uploadedAt?: string, customDate?: string): string {
    const rawDate = customDate || uploadedAt;
    if (!rawDate) return '–';

    try {
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return rawDate;
        return d.toLocaleDateString('de-CH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return rawDate;
    }
}

function getDisplayFilename(item: MemberDownloadItem): string {
    if (item.customFilename && item.customFilename.trim() !== '') {
        return item.customFilename.trim();
    }
    if (item.originalFilename && item.originalFilename.trim() !== '') {
        return item.originalFilename.trim();
    }
    if (item.fileUrl) {
        const urlParts = item.fileUrl.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart) {
            return decodeURIComponent(lastPart.split('?')[0]);
        }
    }
    if (item.externalUrl) {
        try {
            const parsed = new URL(item.externalUrl);
            if (parsed.hostname.includes('drive.google.com')) {
                return 'Google Drive Datei';
            }
            if (parsed.hostname.includes('dropbox.com')) {
                return 'Dropbox Datei';
            }
            return 'Externer Link';
        } catch {
            return 'Externer Link';
        }
    }
    return '–';
}

function getFileCategory(item: MemberDownloadItem): {
    label: string;
    iconColor: string;
    badgeBg: string;
    badgeColor: string;
} {
    const ext = (
        item.fileExtension ||
        (item.originalFilename?.split('.').pop() || '') ||
        (item.customFilename?.split('.').pop() || '')
    ).toLowerCase();

    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        return {
            label: 'ZIP',
            iconColor: '#f59e0b',
            badgeBg: 'rgba(245, 158, 11, 0.15)',
            badgeColor: '#f59e0b',
        };
    }
    if (['pdf'].includes(ext)) {
        return {
            label: 'PDF',
            iconColor: '#ef4444',
            badgeBg: 'rgba(239, 68, 68, 0.15)',
            badgeColor: '#ef4444',
        };
    }
    if (['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg'].includes(ext)) {
        return {
            label: 'AUDIO',
            iconColor: '#a855f7',
            badgeBg: 'rgba(168, 85, 247, 0.15)',
            badgeColor: '#a855f7',
        };
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
        return {
            label: 'BILD',
            iconColor: '#3b82f6',
            badgeBg: 'rgba(59, 130, 246, 0.15)',
            badgeColor: '#3b82f6',
        };
    }
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
        return {
            label: 'DOC',
            iconColor: '#06b6d4',
            badgeBg: 'rgba(6, 182, 212, 0.15)',
            badgeColor: '#06b6d4',
        };
    }

    if (item.externalUrl && !item.fileUrl) {
        return {
            label: 'DRIVE / LINK',
            iconColor: 'var(--gospel-contrast)',
            badgeBg: 'rgba(27, 123, 182, 0.15)',
            badgeColor: 'var(--gospel-contrast)',
        };
    }

    return {
        label: ext ? ext.toUpperCase() : 'DATEI',
        iconColor: '#9ca3af',
        badgeBg: 'rgba(156, 163, 175, 0.15)',
        badgeColor: '#9ca3af',
    };
}

export function MemberDownloadsTable({
    items,
    sectionTitle = 'Downloads & Dateien',
    sectionDescription,
}: MemberDownloadsTableProps) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <section className="my-14" aria-labelledby="downloads-heading">
            <div className="mb-6">
                <h3
                    id="downloads-heading"
                    className="text-2xl font-bold tracking-tight mb-2"
                    style={{ color: 'var(--foreground)' }}
                >
                    {sectionTitle}
                </h3>
                {sectionDescription && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {sectionDescription}
                    </p>
                )}
            </div>

            {/* Desktop / Tablet Table View (hidden on very small screens) */}
            <div
                className="hidden md:block overflow-hidden rounded-xl border shadow-sm"
                style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--surface)',
                }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr
                                className="border-b text-xs font-semibold uppercase tracking-wider"
                                style={{
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-muted)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.15)',
                                }}
                            >
                                <th scope="col" className="py-3.5 px-4 w-14 text-center">
                                    Status
                                </th>
                                <th scope="col" className="py-3.5 px-4 min-w-[280px]">
                                    Name
                                </th>
                                <th scope="col" className="py-3.5 px-4 whitespace-nowrap w-28">
                                    Grösse
                                </th>
                                <th scope="col" className="py-3.5 px-4 whitespace-nowrap w-28">
                                    Datum
                                </th>
                                <th scope="col" className="py-3.5 px-4 text-right whitespace-nowrap w-36">
                                    Aktion
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                            {items.map((item, index) => {
                                const filename = getDisplayFilename(item);
                                const filesize = formatFileSize(item.fileSize, item.customFilesize);
                                const uploadDate = formatUploadDate(item.uploadedAt, item.customUploadDate);
                                const category = getFileCategory(item);
                                const downloadUrl = item.fileUrl
                                    ? `${item.fileUrl}?dl=${encodeURIComponent(filename)}`
                                    : item.externalUrl || '#';
                                const isExternal = !item.fileUrl && !!item.externalUrl;

                                return (
                                    <tr
                                        key={item._key || `download-${index}`}
                                        className="transition-colors hover:bg-[var(--surface-hover)] group"
                                    >
                                        {/* Status Column */}
                                        <td className="py-4 px-4 text-center align-middle">
                                            {item.isNew ? (
                                                <span
                                                    className="text-base leading-none"
                                                    title="neu"
                                                    aria-label="neu"
                                                >
                                                    🔥
                                                </span>
                                            ) : (
                                                <span
                                                    className="inline-block w-2 h-2 rounded-full opacity-30"
                                                    style={{ backgroundColor: 'var(--text-muted)' }}
                                                />
                                            )}
                                        </td>

                                        {/* Name & Description Column */}
                                        <td className="py-4 px-4 align-middle">
                                            <div className="flex items-start gap-3">
                                                <div>
                                                    <div
                                                        className="font-medium text-sm leading-snug"
                                                        style={{ color: 'var(--foreground)' }}
                                                    >
                                                        {item.title}
                                                    </div>
                                                    {item.description && (
                                                        <p
                                                            className="text-xs mt-0.5 leading-relaxed"
                                                            style={{ color: 'var(--text-muted)' }}
                                                        >
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <span
                                                    className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5"
                                                    style={{
                                                        backgroundColor: category.badgeBg,
                                                        color: category.badgeColor,
                                                    }}
                                                >
                                                    {category.label}
                                                </span>
                                            </div>
                                        </td>



                                        {/* Filesize Column */}
                                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                {filesize}
                                            </span>
                                        </td>

                                        {/* Date Column */}
                                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {uploadDate}
                                            </span>
                                        </td>

                                        {/* Download Link Column */}
                                        <td className="py-4 px-4 text-right align-middle whitespace-nowrap">
                                            <a
                                                href={downloadUrl}
                                                {...(isExternal
                                                    ? { target: '_blank', rel: 'noopener noreferrer' }
                                                    : { download: filename })}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all transform active:scale-95 shadow-sm text-white hover:brightness-110"
                                                style={{
                                                    backgroundColor: 'var(--gospel-primary)',
                                                    textDecoration: 'none',
                                                }}
                                                title={isExternal ? 'In neuem Tab öffnen' : `${filename} herunterladen`}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                    />
                                                </svg>
                                                <span>Download</span>
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card List View (visible only on small screens) */}
            <div className="md:hidden space-y-3">
                {items.map((item, index) => {
                    const filename = getDisplayFilename(item);
                    const filesize = formatFileSize(item.fileSize, item.customFilesize);
                    const uploadDate = formatUploadDate(item.uploadedAt, item.customUploadDate);
                    const category = getFileCategory(item);
                    const downloadUrl = item.fileUrl
                        ? `${item.fileUrl}?dl=${encodeURIComponent(filename)}`
                        : item.externalUrl || '#';
                    const isExternal = !item.fileUrl && !!item.externalUrl;

                    return (
                        <div
                            key={item._key || `mobile-download-${index}`}
                            className="p-4 rounded-xl border transition-all"
                            style={{
                                borderColor: 'var(--border-color)',
                                backgroundColor: 'var(--surface)',
                            }}
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                                        style={{
                                            backgroundColor: category.badgeBg,
                                            color: category.badgeColor,
                                        }}
                                    >
                                        {category.label}
                                    </span>
                                    {item.isNew && (
                                        <span
                                            className="text-base leading-none"
                                            title="neu"
                                            aria-label="neu"
                                        >
                                            🔥
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {uploadDate}
                                </span>
                            </div>

                            <div className="font-semibold text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                                {item.title}
                            </div>

                            {item.description && (
                                <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                    {item.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="min-w-0 flex-1">
                                    <div
                                        className="font-mono text-[11px] truncate"
                                        style={{ color: 'var(--text-secondary)' }}
                                        title={filename}
                                    >
                                        {filename}
                                    </div>
                                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                        {filesize}
                                    </div>
                                </div>

                                <a
                                    href={downloadUrl}
                                    {...(isExternal
                                        ? { target: '_blank', rel: 'noopener noreferrer' }
                                        : { download: filename })}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold shrink-0 shadow-sm text-white hover:brightness-110 active:scale-95 transition-all"
                                    style={{
                                        backgroundColor: 'var(--gospel-primary)',
                                        textDecoration: 'none',
                                    }}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                        />
                                    </svg>
                                    <span>Download</span>
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
