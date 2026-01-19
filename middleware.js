import { NextResponse } from 'next/server';

export function middleware(req) {
  const cfCountry = req.headers.get('cf-ipcountry');
  const country = cfCountry || 'MX';
  console.log(`[Seguridad] Pais: ${cfCountry} | Usado: ${country} | Ruta: ${req.nextUrl.pathname}`);

  const isProtectedPath = 
    req.nextUrl.pathname.startsWith('/api/resenas') || 
    req.nextUrl.pathname === '/';

  if (isProtectedPath) {
    if (country !== 'MX') {
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