import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/signup`;

    const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}