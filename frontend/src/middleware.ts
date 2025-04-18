// middleware.ts
import { NextResponse, NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // Only protect /users and all its sub‑paths
  if (pathname.startsWith('/users')) {
    // forward the browser cookie into our backend call
    const cookie = request.headers.get('cookie') || '';

    // hit our own /api/user/me endpoint
    const meRes = await fetch(
      `${process.env.BACKEND_URL || origin}/api/user/me`,
      {
        headers: { cookie },
        // always fetch fresh
        cache: 'no-store',
      }
    );

    // 401 or 403 → not allowed
    if (!meRes.ok) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // parse roles, make sure we have an array
    const me = await meRes.json();
    if (!Array.isArray(me.roles) || !me.roles.includes('ROLE_ADMIN')) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // all good: let the request through
  return NextResponse.next();
}

export const config = {
  matcher: ['/users/:path*'],  // run this on /users and anything under it
};
