import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { captcha, formSubject, ...formData } = body;

        if (!formData.firmaName || !formData.email || !captcha) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify reCAPTCHA
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        if (!secretKey) {
            console.warn("RECAPTCHA_SECRET_KEY is not set. Skipping verification.");
        } else if (process.env.NODE_ENV === 'production') {
            const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
            const captchaRes = await fetch(verifyUrl, { method: "POST" });
            const captchaData = await captchaRes.json();

            if (!captchaData.success || captchaData.score < 0.5) {
                console.warn("reCAPTCHA failed or low score:", captchaData);
                return NextResponse.json(
                    { message: "Verification failed. Please try again." },
                    { status: 400 }
                );
            }
        }

        // Create Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.example.com",
            port: parseInt(process.env.EMAIL_PORT || "587"),
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Build email
        const sponsorType = formData.sponsorType || 'Nicht angegeben';
        const htmlContent = `
            <h3>Neue Sponsoring-Anmeldung via gospelproject.ch</h3>
            <table style="border-collapse: separate; border-spacing: 1px; width: 100%;">
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold; width: 30%;">Sponsor-Typ:</td><td style="padding: 10px; background-color: #f9f9f9;">${sponsorType}</td></tr>
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold;">Firma / Name:</td><td style="padding: 10px; background-color: #f9f9f9;">${formData.firmaName}</td></tr>
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold;">Kontaktperson:</td><td style="padding: 10px; background-color: #f9f9f9;">${formData.kontaktperson || '-'}</td></tr>
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold;">Adresse:</td><td style="padding: 10px; background-color: #f9f9f9;">${formData.adresse || '-'}</td></tr>
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold;">PLZ:</td><td style="padding: 10px; background-color: #f9f9f9;">${formData.plz || '-'}</td></tr>
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold;">Ort:</td><td style="padding: 10px; background-color: #f9f9f9;">${formData.ort || '-'}</td></tr>
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold;">Telefon:</td><td style="padding: 10px; background-color: #f9f9f9;">${formData.telefon || '-'}</td></tr>
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold;">E-Mail:</td><td style="padding: 10px; background-color: #f9f9f9;">${formData.email}</td></tr>
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold;">Beitrag CHF:</td><td style="padding: 10px; background-color: #f9f9f9;">${formData.beitrag || '-'}</td></tr>
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold;">Publikation Programmheft:</td><td style="padding: 10px; background-color: #f9f9f9;">${formData.publikationProgrammheft || '-'}</td></tr>
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold;">Publikation Website:</td><td style="padding: 10px; background-color: #f9f9f9;">${formData.publikationWebsite || '-'}</td></tr>
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold;">Aufführen als:</td><td style="padding: 10px; background-color: #f9f9f9;">${formData.auffuehrenAls || '-'}</td></tr>
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold;">Logo / Inserat:</td><td style="padding: 10px; background-color: #f9f9f9;">${formData.logoInserat || '-'}</td></tr>
                <tr><td style="padding: 10px; background-color: #f9f9f9; font-weight: bold;">Mitteilung:</td><td style="padding: 10px; background-color: #f9f9f9;">${(formData.mitteilung || '-').replace(/\n/g, "<br>")}</td></tr>
            </table>
        `;

        const textContent = `Neue Sponsoring-Anmeldung via gospelproject.ch\n\nSponsor-Typ: ${sponsorType}\nFirma/Name: ${formData.firmaName}\nKontaktperson: ${formData.kontaktperson || '-'}\nAdresse: ${formData.adresse || '-'}\nPLZ: ${formData.plz || '-'}\nOrt: ${formData.ort || '-'}\nTelefon: ${formData.telefon || '-'}\nE-Mail: ${formData.email}\nBeitrag CHF: ${formData.beitrag || '-'}\nPublikation Programmheft: ${formData.publikationProgrammheft || '-'}\nPublikation Website: ${formData.publikationWebsite || '-'}\nAufführen als: ${formData.auffuehrenAls || '-'}\nLogo/Inserat: ${formData.logoInserat || '-'}\nMitteilung: ${formData.mitteilung || '-'}`;

        await transporter.sendMail({
            from: `"Zusammenklang Formular" <${process.env.EMAIL_USER || "[EMAIL_ADDRESS]"}>`,
            to: "sponsoring@gospelproject.ch",
            bcc: "matthias.zuerrer@gmail.com",
            replyTo: formData.email,
            subject: formSubject || `Neue Sponsoring-Anmeldung von ${formData.firmaName} via gospelproject.ch`,
            text: textContent,
            html: htmlContent,
        });

        return NextResponse.json({ message: "Anmeldung erfolgreich versendet" }, { status: 200 });

    } catch (error: unknown) {
        console.error("Zusammenklang API Error:", error);
        return NextResponse.json(
            { message: "Anmeldung konnte nicht versendet werden" },
            { status: 500 }
        );
    }
}
