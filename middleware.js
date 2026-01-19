import { NextResponse } from 'next/server';

export function middleware(req) {
  const cfCountry = req.headers.get('cf-ipcountry');

  const country = cfCountry || 'MX';

  console.log(`[Acceso] Pais detectado: ${cfCountry} | Ruta: ${req.nextUrl.pathname}`);

  const isProtectedPath = 
    req.nextUrl.pathname.startsWith('/api/resenas') || 
    req.nextUrl.pathname === '/';

  if (isProtectedPath) {
    if (country !== 'MX' && country !== 'US') {
      return NextResponse.json(
        { error: 'Búho Rater solo está disponible en la región de México y EE.UU. 🇲🇽🇺🇸' },
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