import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const audienceId = searchParams.get('audienceId');

        if (!audienceId) {
            return NextResponse.json(
                { error: "Audience ID is required" },
                { status: 400 }
            );
        }

        const API_KEY = process.env.MAILCHIMP_API_KEY;
        const API_SERVER = process.env.MAILCHIMP_API_SERVER; // e.g. 'us1'

        if (!API_KEY || !API_SERVER) {
            console.error("Mailchimp environment variables are missing.");
            return NextResponse.json(
                { error: "Mailchimp configuration is missing on the server." },
                { status: 500 }
            );
        }

        // Fetch segments of type 'static' which correspond to tags in Mailchimp
        const url = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${audienceId}/segments?type=static&count=100`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `apikey ${API_KEY}`,
                "Content-Type": "application/json",
            },
            // Revalidate every hour, tags don't change that often
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Mailchimp API error:", errorText);
            return NextResponse.json(
                { error: "Failed to fetch tags from Mailchimp" },
                { status: response.status }
            );
        }

        const data = await response.json();
        const tags = data.segments.map((segment: any) => ({
            id: segment.id,
            name: segment.name
        }));

        // Allow CORS for Sanity Studio
        const res = NextResponse.json({ tags });
        res.headers.set('Access-Control-Allow-Origin', '*'); 
        res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        return res;

    } catch (error) {
        console.error("Mailchimp Tags API Route error:", error);
        return NextResponse.json(
            { error: "Ein unerwarteter Fehler ist aufgetreten." },
            { status: 500 }
        );
    }
}

export async function OPTIONS(request: Request) {
    const res = new NextResponse(null, { status: 204 });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
}
