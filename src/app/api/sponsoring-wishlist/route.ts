import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "next-sanity";
import path from "path";
import fs from "fs";

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
        const { name, email, cart, message, captcha, publicListing } = (await request.json()) as {
            name: string;
            email: string;
            cart: CartItem[];
            message?: string;
            captcha: string;
            publicListing?: string | boolean;
        };

        if (!name || !email || !cart || cart.length === 0 || !captcha) {
            return NextResponse.json({ message: "Fehlende Pflichtfelder" }, { status: 400 });
        }

        const isListed =
            publicListing === "yes" ||
            publicListing === true ||
            publicListing === "Ja, gerne auf der Website und im Programmheft erwähnen";
        const listingText = isListed
            ? "Ja, gerne auf der Website und im Programmheft erwähnen"
            : "Nicht auf Website und im Programmheft erwähnen (anonym)";

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

        // ── 1. Send notification email to owner ──────────────────────────────
        const sanitizedName = name.replace(/["\r\n]/g, "");
        const notificationHtml = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neues Sponsoring-Zusage via Wunschliste</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 24px;">
        <h2 style="margin-top: 0; color: #0f172a; font-size: 20px; border-bottom: 2px solid #ff9c00; padding-bottom: 8px;">Neues Sponsoring-Zusage via Wunschliste</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>E-Mail:</strong> <a href="mailto:${email}" style="color: #ff9c00;">${email}</a></p>
        <p><strong>Erwähnung (Website &amp; Programmheft):</strong> ${listingText}</p>
        <h3 style="color: #0f172a; margin-top: 20px;">Ausgewählte Wünsche (${cart.reduce((s, c) => s + c.quantity, 0)} Anteile):</h3>
        <ul style="padding-left: 20px;">${itemsHtml}</ul>
        ${totalCHF > 0 ? `<p style="font-size: 16px;"><strong>Gesamtbetrag: CHF ${totalCHF.toFixed(0)}.-</strong></p>` : ""}
        ${message ? `<h3 style="color: #0f172a;">Mitteilung:</h3><p style="background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 3px solid #ff9c00;">${message.replace(/\n/g, "<br>")}</p>` : ""}
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 12px 0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Gesendet über <a href="https://gospelproject.ch/sponsoring/wunschliste" style="color: #94a3b8;">gospelproject.ch/sponsoring/wunschliste</a></p>
    </div>
</body>
</html>`;

        const ownerMailInfo = await transporter.sendMail({
            from: `"Gospelproject Wunschliste" <${process.env.EMAIL_USER || "noreply@gospelproject.ch"}>`,
            to: "sponsoring@gospelproject.ch",
            bcc: "matthias.zuerrer@gmail.com",
            replyTo: `"${sanitizedName}" <${email}>`,
            subject: `Sponsoring-Zusage von ${sanitizedName} – Wunschliste`,
            text:
                `Neues Sponsoring-Zusage via Wunschliste\n\n` +
                `Name: ${name}\nE-Mail: ${email}\n` +
                `Erwähnung (Website & Programmheft): ${listingText}\n\n` +
                `Ausgewählte Wünsche:\n${itemsText}` +
                (totalCHF > 0 ? `\n\nTotal: CHF ${totalCHF.toFixed(0)}.-` : "") +
                (message ? `\n\nMitteilung:\n${message}` : ""),
            html: notificationHtml,
        });

        if (ownerMailInfo.rejected && ownerMailInfo.rejected.length > 0) {
            console.warn("Notification email rejected recipients:", ownerMailInfo.rejected);
        }

        // ── 2. Send confirmation email to submitter ────────────────────────────
        try {
            const confirmationRows = cart
                .map(
                    (item) => `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 0; vertical-align: top;">
                            <strong style="color: #1e293b;">${item.title}</strong>
                            <div style="color: #64748b; font-size: 12px;">${item.categoryTitle}</div>
                        </td>
                        <td style="padding: 10px 8px; text-align: center; vertical-align: top; color: #475569;">
                            ${item.quantity}×
                        </td>
                        <td style="padding: 10px 0; text-align: right; vertical-align: top; font-weight: 600; color: #1e293b;">
                            ${item.unitAmountNum > 0 ? `CHF ${(item.unitAmountNum * item.quantity).toFixed(0)}.-` : "–"}
                        </td>
                    </tr>`
                )
                .join("");

            const confirmationHtml = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wunschliste – Bestätigung</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9;">
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <div style="padding: 24px 0; border-bottom: 2px solid #f0f0f0; text-align: center;">
                        <h1 style="color: #ff9c00; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Gospelproject</h1>
                        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Wunschliste – Bestätigung</p>
                    </div>

                    <div style="padding: 30px 20px;">
                        <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Vielen Dank für deine Unterstützung, ${name}!</h2>
                        <p style="color: #475569; font-size: 15px;">
                            Wir haben deine Zusage zum finanziellen Beitrag über unsere Wunschliste erhalten. Herzlichen Dank, gemeinsam bringen wir das Gospelproject zum Klingen! 
                        </p>

                        <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin: 25px 0;">
                            <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                                Deine ausgewählten Wünsche
                            </h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <thead>
                                    <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: left;">
                                        <th style="padding: 6px 0; font-weight: 600;">Position</th>
                                        <th style="padding: 6px 8px; text-align: center; font-weight: 600;">Anzahl</th>
                                        <th style="padding: 6px 0; text-align: right; font-weight: 600;">Betrag</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${confirmationRows}
                                </tbody>
                                ${totalCHF > 0 ? `
                                <tfoot>
                                    <tr>
                                        <td colspan="2" style="padding: 12px 0 0 0; font-weight: 700; font-size: 15px; color: #0f172a;">Gesamtbetrag</td>
                                        <td style="padding: 12px 0 0 0; text-align: right; font-weight: 700; font-size: 16px; color: #ff9c00;">
                                            CHF ${totalCHF.toFixed(0)}.-
                                        </td>
                                    </tr>
                                </tfoot>` : ""}
                            </table>
                        </div>

                        <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 14px 18px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Erwähnung auf Website &amp; Programmheft
                            </p>
                            <p style="margin: 4px 0 0 0; font-size: 14px; color: #1e293b; font-weight: 500;">
                                ${listingText}
                            </p>
                        </div>

                        ${message ? `
                        <div style="border-left: 3px solid #ff9c00; padding: 12px 16px; margin: 20px 0; background-color: #fffbeb; border-radius: 0 8px 8px 0;">
                            <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 600;">Deine Mitteilung an uns:</p>
                            <p style="margin: 6px 0 0 0; font-size: 14px; color: #78350f; font-style: italic;">${message.replace(/\n/g, "<br>")}</p>
                        </div>` : ""}

                        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                            Im Anhang findest du unsere Zahlungsinformationen (QR-Rechnung / Bankverbindung / Twint). Wir werden uns zudem in Kürze persönlich bei dir melden.
                            Wenn du in der Zwischenzeit Fragen hast, kannst du einfach direkt auf diese E-Mail antworten.
                        </p>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f0f0f0;">
                            <p style="margin: 0; color: #475569; font-size: 14px;">Herzliche Grüsse,</p>
                            <p style="margin: 4px 0 0 0; font-weight: 700; color: #1e293b; font-size: 15px;">Dein Gospelproject-Team</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px;"><a href="https://gospelproject.ch" style="color: #ff9c00; text-decoration: none;">www.gospelproject.ch</a></p>
                        </div>
                    </div>

                    <div style="padding: 20px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #94a3b8; text-align: center;">
                        <p style="margin: 0;">© ${new Date().getFullYear()} Gospelproject. Alle Rechte vorbehalten.</p>
                    </div>
                </div>
</body>
</html>`;

            const confirmationText =
                `Hallo ${name},\n\n` +
                `Vielen Dank für deine Unterstützung des Gospelprojects!\n\n` +
                `Wir haben deine ausgewählten Wünsche über unsere Wunschliste erhalten:\n\n` +
                cart
                    .map(
                        (item) =>
                            `- ${item.title} (${item.categoryTitle}) × ${item.quantity}` +
                            (item.unitAmountNum > 0
                                ? ` = CHF ${(item.unitAmountNum * item.quantity).toFixed(0)}.-`
                                : "")
                    )
                    .join("\n") +
                (totalCHF > 0 ? `\n\nGesamtbetrag: CHF ${totalCHF.toFixed(0)}.-` : "") +
                `\n\nErwähnung auf Website & Programmheft: ${listingText}` +
                (message ? `\n\nDeine Mitteilung:\n${message}` : "") +
                `\n\nIm Anhang findest du unsere Zahlungsinformationen (QR-Rechnung / Bankverbindung). Wir werden uns zudem in Kürze persönlich bei dir melden.\n` +
                `Bei Fragen kannst du einfach direkt auf diese E-Mail antworten.\n\n` +
                `Herzliche Grüsse,\n` +
                `Dein Gospelproject-Team\n` +
                `www.gospelproject.ch`;

            // Check for payment information PDF in public/
            const pdfFilename = "Zahlungsinformation-Spenden-Sponsoring-2026.pdf";
            const pdfPath = path.join(process.cwd(), "public", pdfFilename);
            const attachments = [];

            if (fs.existsSync(pdfPath)) {
                attachments.push({
                    filename: pdfFilename,
                    path: pdfPath,
                    contentType: "application/pdf",
                });
            }

            await transporter.sendMail({
                from: `"Gospelproject" <${process.env.EMAIL_USER || "noreply@gospelproject.ch"}>`,
                to: email,
                replyTo: "sponsoring@gospelproject.ch",
                subject: "Vielen Dank für deine Unterstützung – Gospelproject Wunschliste",
                text: confirmationText,
                html: confirmationHtml,
                ...(attachments.length > 0 && { attachments }),
            });
        } catch (confirmError) {
            console.error("Failed to send confirmation email to submitter:", confirmError);
        }

        return NextResponse.json({ message: "Anfrage erfolgreich gesendet" }, { status: 200 });
    } catch (error: unknown) {
        console.error("Sponsoring Wishlist API Error:", error);
        return NextResponse.json(
            { message: "Anfrage konnte nicht gesendet werden" },
            { status: 500 }
        );
    }
}
