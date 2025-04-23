// app/api/checkout/create-payment-intent/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  // Forward everything under /api/checkout/create-payment-intent
  const body = await request.json();

  // Adjust this if your backend lives at a different host in Docker
  const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/checkout/create-payment-intent`;

  const res = await fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });

  // If backend failed, bubble up status + error
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
