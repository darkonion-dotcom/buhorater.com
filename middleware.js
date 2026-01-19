import { NextResponse } from 'next/server';

export function middleware(req) {
  const country = req.headers.get('cf-ipcountry') || req.geo?.country || 'MX';

  const isProtectedPath = 
    req.nextUrl.pathname.startsWith('/api/resenas') || 
    req.nextUrl.pathname === '/';

  if (isProtectedPath) {
    if (country && country !== 'MX') {
      return NextResponse.json(
        { error: 'Búho Rater solo está disponible para estudiantes en México 🇲🇽' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};