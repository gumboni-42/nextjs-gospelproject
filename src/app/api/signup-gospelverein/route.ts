import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from 'crypto';
import { client } from '@/sanity/client';
import fs from 'fs';

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

        // Mailchimp Submission
        const API_KEY = process.env.MAILCHIMP_API_KEY;
        const API_SERVER = process.env.MAILCHIMP_API_SERVER;
        
        const pageData = await client.fetch(`*[_type == "gospelprojectAnmeldungPage"][0]{
            mailchimpAudienceId
        }`);
        const AUDIENCE_ID = pageData?.mailchimpAudienceId || process.env.MAILCHIMP_AUDIENCE_ID;

        if (!API_KEY || !AUDIENCE_ID || !API_SERVER) {
            console.error('Mailchimp configuration missing');
            return NextResponse.json({ message: 'Mailchimp Server configuration error' }, { status: 500 });
        }

        const mailchimpTags = ["Gönner"];
        const mcUrl = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;
        
        const mcData = {
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: vorname,
                LNAME: name,
                STRASSE: adresse || "",
                PLZ: plz || "",
                ORT: ort || "",
                PHONE: telefon || "",
                BDAY: geburtsdatum || "",
                MITTEILUNG: mitteilung || ""
            },
            tags: mailchimpTags
        };

        const mcRes = await fetch(mcUrl, {
            method: "POST",
            headers: {
                Authorization: `apikey ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(mcData),
        });

        const mcResult = await mcRes.json();
        
        fs.appendFileSync('/tmp/mc_debug.log', JSON.stringify({ action: 'POST_MEMBER_GOSPELVEREIN', mcData, mcResOk: mcRes.ok, mcResult }) + '\n');
        
        if (mcRes.ok || mcResult.title === "Member Exists") {
            if (mcResult.title === "Member Exists") {
                const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
                
                // Update the existing member's data (merge fields)
                const updateUrl = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${subscriberHash}`;
                await fetch(updateUrl, {
                    method: "PATCH",
                    headers: {
                        Authorization: `apikey ${API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        merge_fields: mcData.merge_fields
                    }),
                });

                // Also apply tags since the initial POST failed
                const tagsUrl = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${subscriberHash}/tags`;
                const tagsData = {
                    tags: mailchimpTags.map((tag: string) => ({ name: tag, status: 'active' }))
                };
                const tagsRes = await fetch(tagsUrl, {
                    method: "POST",
                    headers: {
                        Authorization: `apikey ${API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(tagsData),
                });
                
                fs.appendFileSync('/tmp/mc_debug.log', JSON.stringify({ action: 'POST_TAGS_GOSPELVEREIN', tagsData, tagsResOk: tagsRes.ok }) + '\n');
            }
        } else {
            console.error('Mailchimp error:', mcResult);
            throw new Error(mcResult.title || 'Mailchimp error');
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
