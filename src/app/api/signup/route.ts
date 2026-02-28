import { NextResponse } from 'next/server';

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

        // Forward to Google Apps Script
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
            // Google Apps Script requires text/plain for CORS to cleanly accept JSON
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(formData),
            redirect: 'follow', // Apps Script usually redirects on POST
        });

        if (!googleRes.ok) {
            throw new Error(`Google Apps Script responded with status ${googleRes.status}`);
        }

        const googleData = await googleRes.json();

        if (googleData.status === 'success') {
            return NextResponse.json({ message: 'Signup received successfully' }, { status: 200 });
        } else {
            console.error('Google App Script error:', googleData);
            throw new Error(googleData.message || 'Unknown error from Google Apps Script');
        }

    } catch (error: any) {
        console.error('Signup form error:', error);
        return NextResponse.json(
            { message: 'Internal server error while processing signup.' },
            { status: 500 }
        );
    }
}
