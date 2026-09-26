"use client";

interface PromoBadgeProps {
    text: string;
    href?: string;
}

export function PromoBadge({ text, href = "/konzerte" }: PromoBadgeProps) {
    return (
        <a
            href={href}
            aria-label={text}
            className="promo-badge"
        >
            {/* Full SVG from /public */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/promo-button.svg"
                alt=""
                aria-hidden="true"
                className="promo-badge__svg"
            />

            {/* Text overlay */}
            <span className="promo-badge__text">
                {text}
            </span>

            <style>{`
                .promo-badge {
                    position: absolute;
                    bottom: 2rem;
                    right: 1.5rem;
                    z-index: 20;
                    width: 120px;
                    height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    transform: rotate(25deg);
                    transition: transform 0.25s ease, filter 0.25s ease;
                    filter: drop-shadow(0 4px 16px rgba(0,0,0,0.35));
                    padding: 12px;
                    box-sizing: content-box;
                }

                @media (min-width: 768px) {
                    .promo-badge {
                        width: 120px;
                        height: 120px;
                        bottom: 2.5rem;
                        right: 2.5rem;
                    }
                }

                .promo-badge:hover {
                    transform: rotate(25deg) scale(1.07);
                    filter: drop-shadow(0 8px 24px rgba(0,0,0,0.5)) brightness(1.08);
                }

                .promo-badge__svg {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    overflow: visible;
                }

                .promo-badge__text {
                    position: relative;
                    z-index: 1;
                    color: #fff;
                    font-family: var(--font-lato, sans-serif);
                    font-weight: 900;
                    font-size: 0.95rem;
                    line-height: 1.25;
                    text-align: center;
                    padding: 0 1.5rem;
                    text-shadow: 0 1px 4px rgba(0,0,0,0.25);
                    letter-spacing: 0.01em;
                    pointer-events: none;
                    max-width: 100px;
                }

                @media (min-width: 768px) {
                    .promo-badge__text {
                        font-size: 1.05rem;
                        max-width: 120px;
                    }
                }
            `}</style>
        </a>
    );
}
