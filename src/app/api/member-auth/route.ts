import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const { password } = await req.json()

    if (!process.env.MEMBER_PASSWORD) {
        return NextResponse.json(
            { success: false, error: 'Server misconfiguration: MEMBER_PASSWORD not set.' },
            { status: 500 }
        )
    }

    if (password === process.env.MEMBER_PASSWORD) {
        const response = NextResponse.json({ success: true })
        response.cookies.set('member-auth', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        })
        return response
    }

    return NextResponse.json(
        { success: false, error: 'Falsches Passwort. Bitte versuche es erneut.' },
        { status: 401 }
    )
}
