import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

export async function POST(req: NextRequest) {
    try {
        const { body, isValidSignature } = await parseBody<{ _type: string; slug?: string }>(
            req,
            process.env.SANITY_REVALIDATE_SECRET
        );

        console.log('[revalidate] Webhook received. _type:', body?._type, '| valid signature:', isValidSignature);

        if (!isValidSignature) {
            console.error('[revalidate] Invalid signature — check SANITY_REVALIDATE_SECRET matches the webhook secret on sanity.io');
            return new Response('Invalid signature', { status: 401 });
        }

        if (!body?._type) {
            console.error('[revalidate] Missing _type in webhook body');
            return new Response('Bad Request', { status: 400 });
        }

        // Revalidate the cache tag matching the Sanity document type
        console.log('[revalidate] Calling revalidateTag for:', body._type);
        revalidateTag(body._type, 'default');

        return NextResponse.json({
            revalidated: true,
            now: Date.now(),
            type: body._type
        });
    } catch (err: unknown) {
        console.error('[revalidate] Error:', err);
        return new Response(err instanceof Error ? err.message : String(err), { status: 500 });
    }
}