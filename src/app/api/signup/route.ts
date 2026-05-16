import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getSignupEmailContent } from '@/components/signup/SignupEmail';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, ...formData } = body;

        if (!token) {
            return NextResponse.json(
                { message: 'reCAPTCHA token is missing' },
                { status: 400 }
            );
        }

        // Verify reCAPTCHA token
        if (process.env.NODE_ENV === 'production') {
            const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
            if (!recaptchaSecret) {
                console.error('RECAPTCHA_SECRET_KEY is not defined');
                return NextResponse.json(
                    { message: 'Server configuration error' },
                    { status: 500 }
                );
            }

            const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `secret=${encodeURIComponent(recaptchaSecret)}&response=${encodeURIComponent(token)}`,
            });

            const verifyData = await verifyRes.json();

            if (!verifyData.success || verifyData.score < 0.5) {
                return NextResponse.json(
                    { message: 'reCAPTCHA verification failed', score: verifyData.score },
                    { status: 400 }
                );
            }
        }

        // Fetch Configuration from Sanity
        const pageData = await client.fetch(`*[_type == "gospelprojectAnmeldungPage"][0]{
            _id,
            submissionMethod,
            mailchimpAudienceId,
            mailchimpTags,
            signupLimit,
            signupCount
        }`);

        if (!pageData) {
            return NextResponse.json({ message: 'Configuration for Anmeldung not found.' }, { status: 500 });
        }

        const { _id, submissionMethod = 'googleSheets', mailchimpAudienceId, mailchimpTags, signupLimit, signupCount = 0 } = pageData;

        // Check Signup Limit
        if (signupLimit && signupCount >= signupLimit) {
            return NextResponse.json({ message: 'Ausgebucht. Leider sind keine weiteren Anmeldungen mehr möglich.' }, { status: 400 });
        }

        let mailchimpSuccess = false;
        let googleSheetsSuccess = false;

        // Mailchimp Submission
        if (submissionMethod === 'mailchimp' || submissionMethod === 'both') {
            const API_KEY = process.env.MAILCHIMP_API_KEY;
            // distinct audience id check
            const AUDIENCE_ID = mailchimpAudienceId || process.env.MAILCHIMP_AUDIENCE_ID;
            const API_SERVER = process.env.MAILCHIMP_API_SERVER;

            if (!API_KEY || !AUDIENCE_ID || !API_SERVER) {
                console.error('Mailchimp configuration missing');
                return NextResponse.json({ message: 'Mailchimp Server configuration error' }, { status: 500 });
            }

            const mcUrl = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

            const mcData = {
                email_address: formData.email,
                status: "subscribed",
                merge_fields: {
                    FNAME: formData.vorname,
                    LNAME: formData.name,
                    ANREDE: formData.anrede || "",
                    STRASSE: formData.strasse || "",
                    PLZ: formData.plz || "",
                    ORT: formData.ort || "",
                    PHONE: formData.telefon || "",
                    BDAY: formData.geburtsdatum || "",
                    SCHONDABEI: formData.schonDabei || "",
                    STIMMLAGE: formData.stimmlage || "",
                    DEMO: formData.demoAufnahme || "",
                    MITTEILUNG: formData.mitteilung || ""
                },
                tags: mailchimpTags || []
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

            if (mcRes.ok || mcResult.title === "Member Exists") {
                if (mcResult.title === "Member Exists") {
                    const subscriberHash = crypto.createHash('md5').update(formData.email.toLowerCase()).digest('hex');
                    
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

                    // Also apply tags if they exist
                    if (mailchimpTags && mailchimpTags.length > 0) {
                        const tagsUrl = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${subscriberHash}/tags`;
                        const tagsData = {
                            tags: mailchimpTags.map((tag: string) => ({ name: tag, status: 'active' }))
                        };
                        await fetch(tagsUrl, {
                            method: "POST",
                            headers: {
                                Authorization: `apikey ${API_KEY}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(tagsData),
                        });
                    }
                }
                mailchimpSuccess = true;
            } else {
                console.error('Mailchimp error:', mcResult);
                throw new Error(mcResult.title || 'Mailchimp error');
            }
        }

        // Forward to Google Apps Script
        if (submissionMethod === 'googleSheets' || submissionMethod === 'both') {
            const googleScriptUrl = process.env.GOOGLE_SCRIPT_SIGNUP_URL;
            if (!googleScriptUrl) {
                console.error('GOOGLE_SCRIPT_SIGNUP_URL is not defined');
                return NextResponse.json(
                    { message: 'Server configuration error' },
                    { status: 500 }
                );
            }

            const googleRes = await fetch(googleScriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(formData),
                redirect: 'follow',
            });

            if (!googleRes.ok) {
                throw new Error(`Google Apps Script responded with status ${googleRes.status}`);
            }

            const googleData = await googleRes.json();

            if (googleData.status === 'success') {
                googleSheetsSuccess = true;
            } else {
                console.error('Google App Script error:', googleData);
                throw new Error(googleData.message || 'Unknown error from Google Apps Script');
            }
        }

        // If either method was chosen and succeeded, increment Sanity count
        if (mailchimpSuccess || googleSheetsSuccess) {
            try {
                if (_id && process.env.SANITY_API_WRITE_TOKEN) {
                    const writeClient = client.withConfig({
                        token: process.env.SANITY_API_WRITE_TOKEN,
                        useCdn: false
                    });

                    const publishedId = _id.replace(/^drafts\./, '');

                    // Always increment the published document
                    await writeClient.patch(publishedId).setIfMissing({ signupCount: 0 }).inc({ signupCount: 1 }).commit();
                    console.log(`signupCount incremented for published document ${publishedId}`);

                    // Also try to increment the draft (if one exists) to prevent
                    // Studio publish from overwriting the count with a stale value
                    try {
                        await writeClient.patch(`drafts.${publishedId}`).setIfMissing({ signupCount: 0 }).inc({ signupCount: 1 }).commit();
                        console.log(`signupCount also incremented for draft document`);
                    } catch {
                        // Draft doesn't exist — that's fine
                    }
                } else if (!process.env.SANITY_API_WRITE_TOKEN) {
                    console.warn('SANITY_API_WRITE_TOKEN is not defined, cannot increment signupCount.');
                }
            } catch (countError) {
                // Don't fail the signup just because the count increment failed
                console.error('Failed to increment signupCount in Sanity:', countError);
            }

            // Send Email Confirmation
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST || "smtp.example.com",
                    port: parseInt(process.env.EMAIL_PORT || "587"),
                    secure: process.env.EMAIL_SECURE === "true",
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                const { subject, htmlContent, textContent } = getSignupEmailContent(formData);

                await transporter.sendMail({
                    from: `"Gospelproject" <${process.env.EMAIL_USER || "noreply@gospelproject.ch"}>`,
                    to: formData.email,
                    bcc: "webformular@gospelproject.ch",
                    replyTo: "info@gospelproject.ch",
                    subject: subject,
                    text: textContent,
                    html: htmlContent,
                });
            } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
                // We don't throw here to ensure the user still sees a success message 
                // since their data WAS successfully stored in Mailchimp/Sheets.
            }

            return NextResponse.json({ message: 'Signup received successfully' }, { status: 200 });
        } else {
            throw new Error('No submission method was successful');
        }

    } catch (error: any) {
        console.error('Signup form error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error while processing signup.' },
            { status: 500 }
        );
    }
}
