import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { client } from '@/sanity/client';

const clientWithToken = client.withConfig({
    // A read token is required to use validatePreviewUrl
    token: process.env.SANITY_API_READ_TOKEN,
});

export async function GET(req: Request) {
    const { isValid, redirectTo = '/' } = await validatePreviewUrl(clientWithToken, req.url);

    if (!isValid) {
        return new Response('Invalid secret', { status: 401 });
    }

    (await draftMode()).enable();
    redirect(redirectTo);
}
