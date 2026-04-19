import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, formType, formSubject, vorname, name, adresse, plz, ort, geburtsdatum, telefon, email, mitteilung } = body;

        if (!token || !vorname || !name || !adresse || !plz || !ort || !geburtsdatum || !telefon || !email) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Format geburtsdatum (YYYY-MM-DD) to DD.MM.YYYY
        let formattedGeburtsdatum = geburtsdatum;
        if (geburtsdatum && geburtsdatum.includes('-')) {
            const [year, month, day] = geburtsdatum.split('-');
            formattedGeburtsdatum = `${day}.${month}.${year}`;
        }

        // Verify reCAPTCHA
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        if (!secretKey) {
            console.warn("RECAPTCHA_SECRET_KEY is not set. Skipping verification.");
        } else if (process.env.NODE_ENV === 'production') {
            const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
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
            from: `"${vorname} ${name}" <${process.env.EMAIL_USER || "noreply@gospelproject.ch"}>`,
            to: "webformular@gospelproject.ch", // Set to contact form's destination
            replyTo: email,
            subject: formSubject || `Neue Gönner-Anmeldung: ${vorname} ${name} via gospelproject.ch`,
            text: `Neue Gönner-Anmeldung\n\nName: ${vorname} ${name}\nAdresse: ${adresse}, ${plz} ${ort}\nGeburtsdatum: ${formattedGeburtsdatum}\nTelefon: ${telefon}\nE-Mail: ${email}\n\nMitteilung:\n${mitteilung || '-'}`,
            html: `
        <h3>Neue Gönner-Anmeldung via gospelproject.ch</h3>
        <p><strong>Vorname:</strong> ${vorname}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Adresse:</strong> ${adresse}</p>
        <p><strong>PLZ/Ort:</strong> ${plz} ${ort}</p>
        <p><strong>Geburtsdatum:</strong> ${formattedGeburtsdatum}</p>
        <p><strong>Telefon:</strong> ${telefon}</p>
        <p><strong>E-Mail:</strong> ${email}</p>
        <p><strong>Mitteilung:</strong></p>
        <p>${mitteilung ? mitteilung.replace(/\\n/g, "<br>") : '-'}</p>
      `,
        });

        return NextResponse.json({ message: "Nachricht erfolgreich versendet" }, { status: 200 });

    } catch (error: unknown) {
        console.error("Gospelverein Signup API Error:", error);
        return NextResponse.json(
            { message: "Nachricht konnte nicht versendet werden" },
            { status: 500 }
        );
    }
}
