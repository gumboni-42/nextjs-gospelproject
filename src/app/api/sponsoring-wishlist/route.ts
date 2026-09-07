import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "next-sanity";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CartItem {
    itemKey: string;
    categoryKey: string;
    title: string;
    categoryTitle: string;
    unitAmount?: string;
    unitAmountNum: number;
    quantity: number;
    maxQty: number;
}

interface SanityItemRecord {
    _key: string;
    totalUnits?: number;
    claimedUnits?: number;
}

interface SanityCategory {
    _key: string;
    items: SanityItemRecord[];
}

interface SanityDoc {
    _id: string;
    categories: SanityCategory[];
}

// ── Sanity write client ───────────────────────────────────────────────────────

const writeClient = createClient({
    projectId: "jynb9blr",
    dataset: "production",
    apiVersion: "2024-01-01",
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
});

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const { name, email, cart, message, captcha } = (await request.json()) as {
            name: string;
            email: string;
            cart: CartItem[];
            message?: string;
            captcha: string;
        };

        if (!name || !email || !cart || cart.length === 0 || !captcha) {
            return NextResponse.json({ message: "Fehlende Pflichtfelder" }, { status: 400 });
        }

        // ── reCAPTCHA verification ────────────────────────────────────────────
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        if (secretKey && process.env.NODE_ENV === "production") {
            const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
            const captchaRes = await fetch(verifyUrl, { method: "POST" });
            const captchaData = (await captchaRes.json()) as { success: boolean; score: number };

            if (!captchaData.success || captchaData.score < 0.5) {
                console.warn("reCAPTCHA failed or low score:", captchaData);
                return NextResponse.json(
                    { message: "Verifizierung fehlgeschlagen. Bitte versuche es erneut." },
                    { status: 400 }
                );
            }
        }

        // ── Patch claimedUnits in Sanity (soft quota – never exceeds totalUnits) ──
        try {
            const doc = await writeClient.fetch<SanityDoc>(
                `*[_type == "sponsoringWunschliste"][0]{
                    _id,
                    "categories": categories[]{
                        _key,
                        "items": items[]{ _key, totalUnits, "claimedUnits": coalesce(claimedUnits, 0) }
                    }
                }`
            );

            if (doc?._id) {
                const patches: Record<string, number> = {};

                for (const cartItem of cart) {
                    const cat = doc.categories?.find((c) => c._key === cartItem.categoryKey);
                    const item = cat?.items?.find((i) => i._key === cartItem.itemKey);
                    if (!item) continue;

                    const current = item.claimedUnits ?? 0;
                    const total = item.totalUnits ?? 0;
                    // Soft cap: never let claimedUnits exceed totalUnits
                    const newValue = Math.min(current + cartItem.quantity, total);

                    patches[
                        `categories[_key=="${cartItem.categoryKey}"].items[_key=="${cartItem.itemKey}"].claimedUnits`
                    ] = newValue;
                }

                if (Object.keys(patches).length > 0) {
                    await writeClient.patch(doc._id).set(patches).commit();
                }
            }
        } catch (sanityErr) {
            // Don't block the email send if Sanity write fails
            console.error("Sanity claimedUnits patch failed:", sanityErr);
        }

        // ── Build email content ───────────────────────────────────────────────
        const totalCHF = cart.reduce((sum, c) => sum + c.unitAmountNum * c.quantity, 0);

        const itemsHtml = cart
            .map(
                (item) =>
                    `<li>
                        <strong>${item.categoryTitle}</strong> – ${item.title}
                        &nbsp;×&nbsp;<strong>${item.quantity}</strong>
                        ${item.unitAmount ? ` <em>(CHF ${item.unitAmount} / Anteil)</em>` : ""}
                        ${item.unitAmountNum > 0 ? ` = <strong>CHF ${(item.unitAmountNum * item.quantity).toFixed(0)}.-</strong>` : ""}
                    </li>`
            )
            .join("\n");

        const itemsText = cart
            .map(
                (item) =>
                    `- [${item.categoryTitle}] ${item.title} × ${item.quantity}` +
                    (item.unitAmount ? ` (CHF ${item.unitAmount} / Anteil)` : "") +
                    (item.unitAmountNum > 0 ? ` = CHF ${(item.unitAmountNum * item.quantity).toFixed(0)}.-` : "")
            )
            .join("\n");

        // ── Send email ────────────────────────────────────────────────────────
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.example.com",
            port: parseInt(process.env.EMAIL_PORT || "587"),
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"${name}" <${process.env.EMAIL_USER || "noreply@gospelproject.ch"}>`,
            to: "matthias.zuerrer@gospelproject.ch",
            replyTo: email,
            subject: `Sponsoring-Interesse von ${name} – Wunschliste`,
            text:
                `Neues Sponsoring-Interesse via Wunschliste\n\n` +
                `Name: ${name}\nE-Mail: ${email}\n\n` +
                `Ausgewählte Wünsche:\n${itemsText}` +
                (totalCHF > 0 ? `\n\nTotal: CHF ${totalCHF.toFixed(0)}.-` : "") +
                (message ? `\n\nMitteilung:\n${message}` : ""),
            html: `
                <h2>Neues Sponsoring-Interesse via Wunschliste</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
                <h3>Ausgewählte Wünsche (${cart.reduce((s, c) => s + c.quantity, 0)} Anteile):</h3>
                <ul>${itemsHtml}</ul>
                ${totalCHF > 0 ? `<p><strong>Gesamtbetrag: CHF ${totalCHF.toFixed(0)}.-</strong></p>` : ""}
                ${message ? `<h3>Mitteilung:</h3><p>${message.replace(/\n/g, "<br>")}</p>` : ""}
                <hr>
                <p style="color:#888;font-size:12px;">Gesendet über gospelproject.ch/sponsoring/wunschliste</p>
            `,
        });

        return NextResponse.json({ message: "Anfrage erfolgreich gesendet" }, { status: 200 });
    } catch (error: unknown) {
        console.error("Sponsoring Wishlist API Error:", error);
        return NextResponse.json(
            { message: "Anfrage konnte nicht gesendet werden" },
            { status: 500 }
        );
    }
}
