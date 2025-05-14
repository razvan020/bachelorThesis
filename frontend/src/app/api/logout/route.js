import { NextResponse } from "next/server";

export async function POST(request) {
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logout`;

    const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });

    return NextResponse.json({ success: true });
}