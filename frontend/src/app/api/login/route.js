import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`;

    const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        return NextResponse.json(
            { error: "Login failed" },
            { status: res.status }
        );
    }

    const data = await res.json();
    return NextResponse.json(data);
}