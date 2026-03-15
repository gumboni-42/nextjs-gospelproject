import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, firstName, lastName } = await request.json();

        if (!email || !firstName || !lastName) {
            return NextResponse.json(
                { error: "Bitte fülle alle Felder aus." },
                { status: 400 }
            );
        }

        const API_KEY = process.env.MAILCHIMP_API_KEY;
        const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
        const API_SERVER = process.env.MAILCHIMP_API_SERVER; // e.g. 'us1'

        if (!API_KEY || !AUDIENCE_ID || !API_SERVER) {
            console.error("Mailchimp environment variables are missing.");
            return NextResponse.json(
                { error: "Newsletter-Dienst ist zurzeit nicht verfügbar. Bitte versuche es später erneut." },
                { status: 500 }
            );
        }

        const url = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

        const data = {
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName,
            },
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `apikey ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            return NextResponse.json({ success: true });
        }

        // Handle Mailchimp specific errors
        if (result.title === "Member Exists") {
            return NextResponse.json(
                { error: "Diese E-Mail-Adresse ist bereits für den Newsletter angemeldet." },
                { status: 400 }
            );
        }

        console.error("Mailchimp error:", result);
        return NextResponse.json(
            { error: "Bei der Newsletter-Anmeldung ist ein Fehler aufgetreten. Bitte versuche es später erneut." },
            { status: 500 }
        );
    } catch (error) {
        console.error("Mailchimp API Route error:", error);
        return NextResponse.json(
            { error: "Ein unerwarteter Fehler ist aufgetreten." },
            { status: 500 }
        );
    }
}
