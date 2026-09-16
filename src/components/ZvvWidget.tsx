"use client";

import { useState, Fragment } from "react";

interface ZvvWidgetProps {
    code?: string;
    eventDate?: string;
    destinationName?: string;
    transportInfo?: string;
}

interface ZvvParsedData {
    isDirectUrl: boolean;
    directUrl?: string;
    to?: string;
    tolat?: string;
    tolon?: string;
    date?: string;
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function parseZvvInput(input?: string): ZvvParsedData | null {
    if (!input) return null;
    const str = input.trim();
    if (!str) return null;

    // Check for plain URL
    if ((str.startsWith('http://') || str.startsWith('https://')) && !str.includes('<')) {
        return { isDirectUrl: true, directUrl: str };
    }

    const extractAttr = (name: string): string | undefined => {
        const regex = new RegExp(`${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
        const match = str.match(regex);
        if (!match) return undefined;
        return (match[1] ?? match[2] ?? match[3])?.trim();
    };

    let to = extractAttr('data-to');
    if (to) {
        // Strip markdown link formatting if user pasted [Address](GoogleMapsURL)
        const mdMatch = to.match(/\[([^\]]+)\]\([^)]+\)/);
        if (mdMatch) {
            to = mdMatch[1].trim();
        }
    }

    const tolat = extractAttr('data-tolat');
    const tolon = extractAttr('data-tolon');
    const date = extractAttr('data-date');

    // Fallback: If no attributes found but an http URL exists (not the CDN script)
    if (!to && !tolat && !tolon && !date) {
        const urlMatch = str.match(/https?:\/\/[^\s"'<>]+/i);
        if (urlMatch && !urlMatch[0].includes('widget.min.js')) {
            return { isDirectUrl: true, directUrl: urlMatch[0] };
        }
        return null;
    }

    return {
        isDirectUrl: false,
        to,
        tolat,
        tolon,
        date,
    };
}

export function ZvvWidget({ code, eventDate, destinationName, transportInfo }: ZvvWidgetProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const parsed = parseZvvInput(code);

    // If no transportInfo and no valid ZVV input, render nothing
    if (!transportInfo && !parsed) return null;

    const targetTo = parsed?.to || destinationName || "";
    const targetDate = parsed?.date || (eventDate ? eventDate.split("T")[0] : "");

    // Construct external ZVV timetable URL
    const zvvWebUrl = parsed?.isDirectUrl && parsed.directUrl
        ? parsed.directUrl
        : `https://www.zvv.ch/de/fahrplan-und-informationen/fahrplan.html?${new URLSearchParams({
            ...(targetTo ? { to: targetTo } : {}),
            ...(targetDate ? { date: targetDate } : {}),
        }).toString()}`;

    // Safely construct sandboxed iframe HTML for widget mode
    const iframeHtml = parsed && !parsed.isDirectUrl ? `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 8px 12px 14px 12px;
      background: transparent;
      overflow-x: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #zvv-connectionsearch-widget {
      width: 100% !important;
      max-width: 100% !important;
    }
  </style>
</head>
<body>
  <script src="https://fpcdn.zvv.ch/cdn/v1/widget.min.js"></script>
  <div id="zvv-connectionsearch-widget"
    data-to="${escapeHtml(targetTo)}"
    ${parsed.tolat ? `data-tolat="${escapeHtml(parsed.tolat)}"` : ''}
    ${parsed.tolon ? `data-tolon="${escapeHtml(parsed.tolon)}"` : ''}
    ${targetDate ? `data-date="${escapeHtml(targetDate)}"` : ''}
  ></div>
</body>
</html>` : "";

    return (
        <div className="mb-3.5 p-3 sm:p-3.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs sm:text-sm text-(--text-secondary)">
            {/* Inline Row: Parking/Transit Info on Left, Fahrplan Widget on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
                {/* Left side: Parking / Transit info */}
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-70 shrink-0 mt-0.5">
                        <path d="M6.5 3c-1.1 0-2 .9-2 2v9c0 .73.4 1.36 1 1.7V17a1 1 0 001 1h1a1 1 0 001-1v-1h5v1a1 1 0 001 1h1a1 1 0 001-1v-1.3c.6-.34 1-.97 1-1.7V5c0-1.1-.9-2-2-2h-7zm0 2h7a.5.5 0 01.5.5V8H6V5.5a.5.5 0 01.5-.5zM6 9.5h8V13H6V9.5zm1.5 5a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    <span className="leading-snug">
                        {transportInfo ? (
                            transportInfo.split(/\r?\n/).map((line, idx, arr) => (
                                <Fragment key={idx}>
                                    {line}
                                    {idx < arr.length - 1 && <br />}
                                </Fragment>
                            ))
                        ) : (
                            "Öffentlicher Verkehr & Anreise"
                        )}
                    </span>
                </div>

                {/* Right side: Subtle gray-ish Fahrplan button / link */}
                {parsed && (
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        {parsed.isDirectUrl ? (
                            <a
                                href={zvvWebUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg !bg-neutral-200/80 hover:!bg-neutral-300 dark:!bg-neutral-800 dark:hover:!bg-neutral-700 !text-neutral-700 hover:!text-neutral-900 dark:!text-neutral-300 dark:hover:!text-white border border-neutral-300/80 dark:border-neutral-700/80 transition-colors shadow-xs"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-70">
                                    <path d="M6.5 3c-1.1 0-2 .9-2 2v9c0 .73.4 1.36 1 1.7V17a1 1 0 001 1h1a1 1 0 001-1v-1h5v1a1 1 0 001 1h1a1 1 0 001-1v-1.3c.6-.34 1-.97 1-1.7V5c0-1.1-.9-2-2-2h-7zm0 2h7a.5.5 0 01.5.5V8H6V5.5a.5.5 0 01.5-.5zM6 9.5h8V13H6V9.5zm1.5 5a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
                                </svg>
                                <span>ZVV Fahrplan</span>
                            </a>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg !bg-neutral-200/80 hover:!bg-neutral-300 dark:!bg-neutral-800 dark:hover:!bg-neutral-700 !text-neutral-700 hover:!text-neutral-900 dark:!text-neutral-300 dark:hover:!text-white border border-neutral-300/80 dark:border-neutral-700/80 transition-colors shadow-xs"
                                aria-expanded={isExpanded}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-70">
                                    <path d="M6.5 3c-1.1 0-2 .9-2 2v9c0 .73.4 1.36 1 1.7V17a1 1 0 001 1h1a1 1 0 001-1v-1h5v1a1 1 0 001 1h1a1 1 0 001-1v-1.3c.6-.34 1-.97 1-1.7V5c0-1.1-.9-2-2-2h-7zm0 2h7a.5.5 0 01.5.5V8H6V5.5a.5.5 0 01.5-.5zM6 9.5h8V13H6V9.5zm1.5 5a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
                                </svg>
                                <span>{isExpanded ? "Fahrplan ausblenden" : "ZVV Fahrplan"}</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className={`w-3 h-3 opacity-60 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                >
                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Expandable Sandboxed Safe Iframe Container */}
            {isExpanded && iframeHtml && (
                <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                        <span>Verbindungssuche ZVV ({targetTo})</span>
                        <a
                            href={zvvWebUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                            <span>Auf zvv.ch öffnen</span>
                        </a>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white shadow-inner">
                        <iframe
                            srcDoc={iframeHtml}
                            title={`ZVV Fahrplan nach ${targetTo}`}
                            className="w-full border-0 block"
                            style={{ height: "340px" }}
                            sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
                            loading="lazy"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
