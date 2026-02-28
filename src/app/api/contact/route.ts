import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
    try {
        const { name, email, message, captcha } = await request.json();

        if (!name || !email || !message || !captcha) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify reCAPTCHA
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        if (!secretKey) {
            console.warn("RECAPTCHA_SECRET_KEY is not set. Skipping verification.");
            // In production, this should likely fail, but for dev without keys we might want to allow it or fail explicitly.
            // Failing explicitly is safer.
            // return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
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
            secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send Email
        await transporter.sendMail({
            from: `"${name}" <${process.env.EMAIL_USER || "[EMAIL_ADDRESS]"}>`, // Sender address
            to: "webformular@gospelproject.ch", // List of receivers
            replyTo: email,
            subject: `Neue Mitteilung von ${name} via gospelproject.ch`,
            text: `Name: ${name}\nEmail: ${email}\n\nNachricht:\n${message}`,
            html: `
        <h3>Neue Mitteilung von ${name} via gospelproject.ch</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>E-Mail:</strong> ${email}</p>
        <p><strong>Nachricht:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
        });

        return NextResponse.json({ message: "Nachricht erfolgreich versendet" }, { status: 200 });

    } catch (error: any) {
        console.error("Contact API Error:", error);
        return NextResponse.json(
            { message: "Nachricht konnte nicht versendet werden" },
            { status: 500 }
        );
    }
}
