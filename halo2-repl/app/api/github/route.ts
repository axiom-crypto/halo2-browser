import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const res = await request.json()
    const code = res.code;
    const githubRes = await fetch("https://github.com/login/oauth/access_token",
        {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code
            })
        })
    const githubJson = await githubRes.json();
    const token = githubJson.access_token;
    return NextResponse.json({token})
}