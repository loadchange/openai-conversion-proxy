import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { password } = await request.json();
    console.log({ password, success: 'ok' });

    if (password && password === '20220108') {
        const res = NextResponse.json({ success: true });
        res.cookies.set("username", "anan");
        return res;

    }
    return NextResponse.json({ success: false }, { status: 500 });
}


