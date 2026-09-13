"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WishlistItem {
    _key: string;
    title: string;
    description?: string;
    unitAmount?: string;
    totalUnits?: number;
    claimedUnits?: number;
    isAvailable?: boolean;
}

export interface WishlistCategory {
    _key: string;
    title: string;
    description?: string;
    emoji?: string;
    items: WishlistItem[];
}

interface CartItem {
    itemKey: string;
    categoryKey: string;
    title: string;
    categoryTitle: string;
    unitAmount?: string;
    unitAmountNum: number;
    quantity: number;
    /** soft cap: totalUnits - claimedUnits at page load time */
    maxQty: number;
}

interface Props {
    categories: WishlistCategory[];
    successTitle?: string;
    successText?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseAmount(str?: string): number {
    if (!str) return 0;
    const num = parseFloat(str.replace(/[^\d.,]/g, "").replace(",", "."));
    return isNaN(num) ? 0 : num;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SponsoringWishlistForm({ categories, successTitle, successText }: Props) {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const formRef = useRef<HTMLDivElement>(null);
    const successRef = useRef<HTMLDivElement>(null);
    const cartRef = useRef<HTMLDivElement>(null);

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cartOpen, setCartOpen] = useState(true);

    // Step: "catalog" | "contact"
    const [step, setStep] = useState<"catalog" | "contact">("catalog");

    // Per-item "quantity to add" inputs (defaults to 1)
    const [inputQty, setInputQty] = useState<Record<string, number>>({});

    // Contact form
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [publicListing, setPublicListing] = useState<"no" | "yes">("no");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // Scroll to contact form when step changes
    useEffect(() => {
        if (step === "contact" && formRef.current) {
            setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    }, [step]);

    // Scroll to success on submit
    useEffect(() => {
        if (status === "success" && successRef.current) {
            successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [status]);

    // Close cart drawer when clicking outside
    useEffect(() => {
        if (!cartOpen) return;
        const handler = (e: MouseEvent) => {
            if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
                setCartOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [cartOpen]);

    // ── Cart helpers ─────────────────────────────────────────────────────────

    const getCartQty = useCallback(
        (itemKey: string) => cart.find((c) => c.itemKey === itemKey)?.quantity ?? 0,
        [cart]
    );

    /** Remaining units = (total - claimed at page load) - what's already in cart */
    const getRemaining = useCallback(
        (item: WishlistItem) => {
            const quota = Math.max(0, (item.totalUnits ?? 0) - (item.claimedUnits ?? 0));
            return Math.max(0, quota - getCartQty(item._key));
        },
        [getCartQty]
    );

    const getInputQty = (itemKey: string) => inputQty[itemKey] ?? 1;

    const setItemInputQty = (itemKey: string, raw: number, remaining: number) => {
        const clamped = Math.max(1, Math.min(raw, Math.max(1, remaining)));
        setInputQty((prev) => ({ ...prev, [itemKey]: clamped }));
    };

    const addToCart = (item: WishlistItem, cat: WishlistCategory, qty: number) => {
        const remaining = getRemaining(item);
        if (remaining <= 0) return;
        const actualQty = Math.min(qty, remaining);
        setCart((prev) => {
            const existing = prev.find((c) => c.itemKey === item._key);
            if (existing) {
                return prev.map((c) =>
                    c.itemKey === item._key ? { ...c, quantity: c.quantity + actualQty } : c
                );
            }
            const quota = Math.max(0, (item.totalUnits ?? 0) - (item.claimedUnits ?? 0));
            return [
                ...prev,
                {
                    itemKey: item._key,
                    categoryKey: cat._key,
                    title: item.title,
                    categoryTitle: cat.title,
                    unitAmount: item.unitAmount,
                    unitAmountNum: parseAmount(item.unitAmount),
                    quantity: actualQty,
                    maxQty: quota,
                },
            ];
        });
        // Reset the "add" input back to 1 and ensure cart is expanded
        setInputQty((prev) => ({ ...prev, [item._key]: 1 }));
        setCartOpen(true);
    };

    const updateCartQty = (itemKey: string, newQty: number) => {
        if (newQty <= 0) {
            setCart((prev) => prev.filter((c) => c.itemKey !== itemKey));
        } else {
            setCart((prev) =>
                prev.map((c) =>
                    c.itemKey === itemKey ? { ...c, quantity: Math.min(newQty, c.maxQty) } : c
                )
            );
        }
    };

    const removeFromCart = (itemKey: string) =>
        setCart((prev) => prev.filter((c) => c.itemKey !== itemKey));

    const cartTotalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
    const cartTotalCHF = cart.reduce((sum, c) => sum + c.unitAmountNum * c.quantity, 0);

    // ── Checkout / submit ────────────────────────────────────────────────────

    const handleCheckout = () => {
        setCartOpen(false);
        setStep("contact");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || cart.length === 0) return;

        setStatus("submitting");
        setErrorMessage("");

        try {
            let captchaToken = "development-bypass";
            if (executeRecaptcha && process.env.NODE_ENV === "production") {
                captchaToken = await executeRecaptcha("sponsoring_wishlist");
            }

            const response = await fetch("/api/sponsoring-wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, cart, publicListing, message, captcha: captchaToken }),
            });

            if (!response.ok) {
                const err = (await response.json()) as { message?: string };
                throw new Error(err.message || "Ein Fehler ist aufgetreten.");
            }

            setStatus("success");
        } catch (err: unknown) {
            setStatus("error");
            setErrorMessage(
                err instanceof Error
                    ? err.message
                    : "Leider gab es ein Problem. Bitte versuche es später noch einmal."
            );
        }
    };

    // ── Success screen ───────────────────────────────────────────────────────

    if (status === "success") {
        return (
            <div ref={successRef} className="mx-auto my-16 text-center scroll-mt-24 max-w-lg">
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: "rgba(255,156,0,0.15)" }}
                >
                    <svg className="w-10 h-10" fill="none" stroke="var(--gospel-primary)" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">
                    {successTitle ?? "Vielen Dank für dein Interesse!"}
                </h3>
                <p className="leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {successText ??
                        "Wir haben deine Auswahl erhalten und melden uns in Kürze bei dir. Gemeinsam bringen wir das Gospelproject zum Klingen!"}
                </p>
                <button
                    onClick={() => {
                        setStatus("idle");
                        setCart([]);
                        setStep("catalog");
                        setName("");
                        setEmail("");
                        setPublicListing("no");
                        setMessage("");
                    }}
                    className="mt-8 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
                    style={{ background: "var(--gospel-primary)", color: "#fff" }}
                >
                    Weitere Auswahl treffen
                </button>
            </div>
        );
    }

    // ── Main render ──────────────────────────────────────────────────────────

    return (
        // pb-28 makes room for the floating cart bar
        <div className="pb-28">

            {/* ── Item catalogue ─────────────────────────────────────── */}
            <div className="space-y-12">
                {categories.map((cat) => {
                    const availableItems = (cat.items ?? []).filter((i) => i.isAvailable !== false);
                    if (availableItems.length === 0) return null;

                    return (
                        <section key={cat._key}>
                            {/* Category header */}
                            <div className="flex items-center gap-3 mb-5">
                                {cat.emoji && (
                                    <span className="text-2xl" aria-hidden="true">{cat.emoji}</span>
                                )}
                                <div>
                                    <h3
                                        className="text-base font-bold uppercase tracking-widest"
                                        style={{ color: "var(--foreground)" }}
                                    >
                                        {cat.title}
                                    </h3>
                                    {cat.description && (
                                        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                                            {cat.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Items grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {availableItems.map((item) => {
                                    const remaining = getRemaining(item);
                                    const inCart = getCartQty(item._key);
                                    const quota = Math.max(0, (item.totalUnits ?? 0) - (item.claimedUnits ?? 0));
                                    const isSoldOut = quota <= 0;
                                    const inputVal = getInputQty(item._key);
                                    const filledPct = item.totalUnits
                                        ? Math.min(100, (((item.claimedUnits ?? 0) + inCart) / item.totalUnits) * 100)
                                        : 0;

                                    return (
                                        <div
                                            key={item._key}
                                            className="rounded-2xl border flex flex-col overflow-hidden transition-all duration-200"
                                            style={{
                                                background: "var(--surface)",
                                                borderColor: inCart > 0 ? "var(--text-muted)" : "var(--border-color)",
                                                boxShadow: "none",
                                                opacity: isSoldOut ? 0.5 : 1,
                                            }}
                                        >
                                            {/* Card body */}
                                            <div className="p-4 flex-1">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <p className="font-semibold text-sm leading-snug">{item.title}</p>
                                                    {inCart > 0 && (
                                                        <span
                                                            className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border"
                                                            style={{
                                                                background: "var(--surface)",
                                                                borderColor: "var(--border-color)",
                                                                color: "var(--foreground)",
                                                            }}
                                                        >
                                                            {inCart}×
                                                        </span>
                                                    )}
                                                </div>

                                                {item.description && (
                                                    <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
                                                        {item.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                                    {item.unitAmount && (
                                                        <span
                                                            className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                                                            style={{
                                                                background: "var(--surface)",
                                                                borderColor: "var(--border-color)",
                                                                color: "var(--text-secondary)",
                                                            }}
                                                        >
                                                            CHF {item.unitAmount} / Anteil
                                                        </span>
                                                    )}
                                                    {item.totalUnits !== undefined && (
                                                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                            {isSoldOut
                                                                ? "Alle Anteile vergeben"
                                                                : `${remaining} von ${quota} verfügbar`}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Quota progress bar */}
                                                {item.totalUnits !== undefined && item.totalUnits > 0 && (
                                                    <div
                                                        className="h-1 rounded-full overflow-hidden"
                                                        style={{ background: "var(--border-color)" }}
                                                    >
                                                        <div
                                                            className="h-full rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${filledPct}%`,
                                                                background: isSoldOut
                                                                    ? "var(--text-muted)"
                                                                    : "var(--text-secondary)",
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card footer: add to cart controls */}
                                            {!isSoldOut ? (
                                                <div
                                                    className="px-4 pb-4 pt-2 flex items-center gap-2 border-t"
                                                    style={{ borderColor: "var(--border-color)" }}
                                                >
                                                    {/* Stepper */}
                                                    <div
                                                        className="flex items-center rounded-lg overflow-hidden border"
                                                        style={{ borderColor: "var(--border-color)" }}
                                                    >
                                                        <button
                                                            type="button"
                                                            id={`wishlist-dec-${item._key}`}
                                                            onClick={() => setItemInputQty(item._key, inputVal - 1, remaining)}
                                                            disabled={inputVal <= 1}
                                                            className="w-8 h-8 flex items-center justify-center text-base font-bold transition-opacity disabled:opacity-30"
                                                            style={{ color: "var(--foreground)" }}
                                                        >
                                                            −
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={remaining}
                                                            value={inputVal}
                                                            onChange={(e) =>
                                                                setItemInputQty(item._key, parseInt(e.target.value) || 1, remaining)
                                                            }
                                                            id={`wishlist-qty-${item._key}`}
                                                            className="w-10 h-8 text-center text-sm font-semibold bg-transparent border-0 focus:outline-none"
                                                            style={{ color: "var(--foreground)" }}
                                                        />
                                                        <button
                                                            type="button"
                                                            id={`wishlist-inc-${item._key}`}
                                                            onClick={() => setItemInputQty(item._key, inputVal + 1, remaining)}
                                                            disabled={inputVal >= remaining}
                                                            className="w-8 h-8 flex items-center justify-center text-base font-bold transition-opacity disabled:opacity-30"
                                                            style={{ color: "var(--foreground)" }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    {/* Add button */}
                                                    <button
                                                        type="button"
                                                        id={`wishlist-add-${item._key}`}
                                                        onClick={() => addToCart(item, cat, inputVal)}
                                                        className="flex-1 h-8 px-3 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center"
                                                        style={{ background: "var(--gospel-primary)", color: "#fff" }}
                                                    >
                                                        In den Warenkorb
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="px-4 pb-3 pt-2">
                                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                        Alle Anteile wurden bereits vergeben.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* ── Contact form (Step 2) ──────────────────────────────── */}
            {step === "contact" && (
                <div
                    ref={formRef}
                    className="mt-16 border-t pt-10 scroll-mt-28"
                    style={{ borderColor: "var(--border-color)" }}
                >
                    <button
                        type="button"
                        onClick={() => setStep("catalog")}
                        className="text-sm underline mb-4 block"
                        style={{ color: "var(--text-muted)", background: "transparent" }}
                    >
                        ← Zurück zur Auswahl
                    </button>
                    <h2 className="text-2xl font-bold mb-1">Deine Kontaktdaten</h2>
                    <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
                        Wir melden uns bei dir, um alles Weitere zu besprechen.
                    </p>

                    {/* Selection summary */}
                    <div
                        className="mb-8 p-4 rounded-xl"
                        style={{ background: "var(--surface)", border: "1px solid var(--border-color)" }}
                    >
                        <p
                            className="text-xs font-semibold mb-3"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Deine Auswahl
                        </p>
                        <ul className="space-y-1.5 mb-3">
                            {cart.map((item) => (
                                <li key={item.itemKey} className="flex font-bold items-start justify-between gap-2 text-sm">
                                    <span>
                                        <span className="text-(--text-muted)">{item.categoryTitle} – </span>
                                        {item.title}
                                    </span>
                                    <span className="shrink-0 font-semibold tabular-nums">
                                        {item.quantity}×
                                        {item.unitAmountNum > 0 && (
                                            <span className="ml-1 font-bold" >
                                                CHF {item.unitAmount}
                                            </span>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {cartTotalCHF > 0 && (
                            <div
                                className="border-t pt-2 mt-2 flex justify-between text-sm font-bold"
                                style={{ borderColor: "var(--border-color)" }}
                            >
                                <span>Total</span>
                                <span>CHF {cartTotalCHF.toFixed(0)}.-</span>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setStep("catalog")}
                            className="mt-3 text-xs underline"
                            style={{ background: "transparent", color: "var(--text-muted)" }}
                        >
                            Auswahl ändern
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="sponsor-name"
                                    className="block text-sm font-medium"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    Name *
                                </label>
                                <input
                                    id="sponsor-name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Max Mustermann"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="sponsor-email"
                                    className="block text-sm font-medium"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    E-Mail *
                                </label>
                                <input
                                    id="sponsor-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@beispiel.ch"
                                />
                            </div>
                        </div>

                        {/* Erwähnung auf Website und im Programmheft */}
                        <fieldset className="space-y-2.5 pt-1">
                            <legend
                                className="block text-sm font-medium mb-1.5"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Erwähnung auf der Website und im Programmheft
                            </legend>
                            <div className="space-y-2.5">
                                <label
                                    htmlFor="wishlist-listing-no"
                                    className="flex items-start gap-3 cursor-pointer select-none group"
                                >
                                    <span className="relative flex items-center justify-center mt-0.5 shrink-0">
                                        <input
                                            id="wishlist-listing-no"
                                            type="radio"
                                            name="publicListing"
                                            value="no"
                                            checked={publicListing === "no"}
                                            onChange={() => setPublicListing("no")}
                                            className="sr-only peer"
                                        />
                                        <span
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${publicListing === "no"
                                                ? "border-[var(--gospel-primary)] ring-2 ring-[var(--gospel-primary)] ring-offset-2 ring-offset-[var(--background)]"
                                                : "border-[var(--border-color)] group-hover:border-[var(--text-muted)]"
                                                } peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--gospel-primary)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--background)]`}
                                        >
                                            {publicListing === "no" && (
                                                <span className="w-2 h-2 rounded-full bg-[var(--gospel-primary)]" />
                                            )}
                                        </span>
                                    </span>
                                    <span className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                        Nicht erwähnen (anonym)
                                    </span>
                                </label>
                                <label
                                    htmlFor="wishlist-listing-yes"
                                    className="flex items-start gap-3 cursor-pointer select-none group"
                                >
                                    <span className="relative flex items-center justify-center mt-0.5 shrink-0">
                                        <input
                                            id="wishlist-listing-yes"
                                            type="radio"
                                            name="publicListing"
                                            value="yes"
                                            checked={publicListing === "yes"}
                                            onChange={() => setPublicListing("yes")}
                                            className="sr-only peer"
                                        />
                                        <span
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${publicListing === "yes"
                                                ? "border-[var(--gospel-primary)] ring-2 ring-[var(--gospel-primary)] ring-offset-2 ring-offset-[var(--background)]"
                                                : "border-[var(--border-color)] group-hover:border-[var(--text-muted)]"
                                                } peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--gospel-primary)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--background)]`}
                                        >
                                            {publicListing === "yes" && (
                                                <span className="w-2 h-2 rounded-full bg-[var(--gospel-primary)]" />
                                            )}
                                        </span>
                                    </span>
                                    <span className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                        Ja, gerne auf der Website und im Programmheft erwähnen
                                    </span>
                                </label>
                            </div>
                        </fieldset>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="sponsor-message"
                                className="block text-sm font-medium"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Mitteilung (optional)
                            </label>
                            <textarea
                                id="sponsor-message"
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Fragen, Anmerkungen oder weitere Informationen…"
                            />
                        </div>

                        {errorMessage && (
                            <div
                                className="p-4 rounded-lg text-sm border"
                                style={{
                                    background: "rgba(239,68,68,0.1)",
                                    borderColor: "rgba(239,68,68,0.3)",
                                    color: "#f87171",
                                }}
                            >
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            id="wishlist-submit-btn"
                            disabled={status === "submitting"}
                            className="px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: "var(--gospel-primary)", color: "#fff" }}
                        >
                            {status === "submitting" ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Wird gesendet…
                                </>
                            ) : (
                                <>
                                    Anfrage senden
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* ── Floating Cart Bar ──────────────────────────────────── */}
            {cartTotalItems > 0 && (
                <div
                    ref={cartRef}
                    className="fixed bottom-0 left-0 right-0 z-50"
                >
                    {/* Cart drawer (expands above the bar) */}
                    <div
                        className="mx-auto max-w-2xl overflow-hidden transition-all duration-300"
                        style={{
                            maxHeight: cartOpen ? "420px" : "0",
                            // smooth height transition
                        }}
                    >
                        <div
                            className="p-5"
                            style={{
                                background: "var(--cart-bg)",
                                borderTop: "1px solid var(--cart-border)",
                                borderLeft: "1px solid var(--cart-border)",
                                borderRight: "1px solid var(--cart-border)",
                                borderRadius: "16px 16px 0 0",
                                boxShadow: "0 -12px 40px rgba(0,0,0,0.45)",
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-base">
                                    Warenkorb
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setCartOpen(false)}
                                    className="text-xs px-2.5 py-1 rounded-lg border transition-colors"
                                    style={{ color: "var(--text-muted)", background: "var(--surface)", borderColor: "var(--cart-border)" }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Cart items */}
                            <ul className="space-y-3 mb-4 overflow-y-auto" style={{ maxHeight: "200px" }}>
                                {cart.map((item) => (
                                    <li key={item.itemKey} className="flex items-center gap-3 text-sm">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{item.title}</p>
                                            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                                {item.categoryTitle}
                                                {item.unitAmount && ` · CHF ${item.unitAmount} / Anteil`}
                                            </p>
                                        </div>

                                        {/* Inline qty stepper */}
                                        <div
                                            className="flex items-center rounded-lg overflow-hidden border shrink-0"
                                            style={{ borderColor: "var(--cart-border)" }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => updateCartQty(item.itemKey, item.quantity - 1)}
                                                className="w-7 h-7 flex items-center justify-center font-bold"
                                                style={{ color: "var(--foreground)" }}
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center font-semibold text-sm tabular-nums">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateCartQty(item.itemKey, item.quantity + 1)}
                                                disabled={item.quantity >= item.maxQty}
                                                className="w-7 h-7 flex items-center justify-center font-bold disabled:opacity-30"
                                                style={{ color: "var(--foreground)" }}
                                            >
                                                +
                                            </button>
                                        </div>

                                        {item.unitAmountNum > 0 && (
                                            <span
                                                className="text-xs font-semibold shrink-0 w-20 text-right tabular-nums"
                                                style={{ color: "var(--foreground)" }}
                                            >
                                                CHF {(item.unitAmountNum * item.quantity).toFixed(0)}.-
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.itemKey)}
                                            className="text-base shrink-0 leading-none"
                                            style={{ color: "var(--text-muted)", background: "transparent" }}
                                            aria-label={`${item.title} entfernen`}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {/* Total + checkout */}
                            {cartTotalCHF > 0 && (
                                <div
                                    className="border-t pt-3 flex justify-between text-sm font-bold mb-4"
                                    style={{ borderColor: "var(--cart-border)" }}
                                >
                                    <span>Total</span>
                                    <span className="tabular-nums">CHF {cartTotalCHF.toFixed(0)}.-</span>
                                </div>
                            )}

                            <button
                                type="button"
                                id="wishlist-checkout-btn"
                                onClick={handleCheckout}
                                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                                style={{ background: "var(--gospel-primary)", color: "#fff" }}
                            >
                                Zur Kasse
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Cart bar pill (always visible) */}
                    <div className="mx-auto max-w-2xl">
                        <div
                            className="w-full flex items-center justify-between px-5 py-3.5 transition-all"
                            style={{
                                background: "var(--cart-bg)",
                                color: "var(--foreground)",
                                borderTop: "1px solid var(--cart-border)",
                                borderLeft: "1px solid var(--cart-border)",
                                borderRight: "1px solid var(--cart-border)",
                                borderRadius: cartOpen ? "0" : "16px 16px 0 0",
                                boxShadow: "0 -8px 32px rgba(0,0,0,0.35)",
                            }}
                        >
                            <button
                                type="button"
                                id="wishlist-cart-bar"
                                onClick={() => setCartOpen((o) => !o)}
                                className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                                style={{ background: "transparent", color: "inherit", padding: 0 }}
                            >
                                <span className="font-semibold text-sm">
                                    {cartTotalItems} {cartTotalItems === 1 ? "Anteil" : "Anteile"} im Warenkorb
                                </span>
                                {cartTotalCHF > 0 && (
                                    <span className="font-bold text-sm tabular-nums text-[var(--text-secondary)]">
                                        (CHF {cartTotalCHF.toFixed(0)}.-)
                                    </span>
                                )}
                                <svg
                                    className="w-4 h-4 transition-transform duration-200"
                                    style={{
                                        transform: cartOpen ? "rotate(180deg)" : "rotate(0deg)",
                                        color: "var(--text-muted)",
                                    }}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-2">
                                {!cartOpen && (
                                    <button
                                        type="button"
                                        onClick={handleCheckout}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                                        style={{ background: "var(--gospel-primary)", color: "#fff" }}
                                    >
                                        Zur Kasse
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
