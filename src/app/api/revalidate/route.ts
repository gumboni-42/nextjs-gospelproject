import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

export async function POST(req: NextRequest) {
    try {
        const { body, isValidSignature } = await parseBody<{ _type: string; slug?: string }>(
            req,
            process.env.SANITY_REVALIDATE_SECRET
        );

        if (!isValidSignature) {
            return new Response('Invalid signature', { status: 401 });
        }

        if (!body?._type) {
            return new Response('Bad Request', { status: 400 });
        }

        // This tells Next.js to clear the cache for this specific document type
        revalidateTag(body._type, {});

        return NextResponse.json({
            revalidated: true,
            now: Date.now(),
            type: body._type
        });
    } catch (err: any) {
        return new Response(err.message, { status: 500 });
    }
}