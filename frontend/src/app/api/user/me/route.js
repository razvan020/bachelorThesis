import { NextResponse } from "next/server";

export async function GET(request) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
        return NextResponse.json(
            { error: "Authorization header missing" },
            { status: 401 }
        );
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/me`;

    const res = await fetch(backendUrl, {
        method: "GET",
        headers: {
            "Authorization": authHeader,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        return NextResponse.json(
            { error: "Failed to fetch user data" },
            { status: res.status }
        );
    }

    const data = await res.json();
    return NextResponse.json(data);
}