import { NextResponse } from 'next/server'

export function proxy(request) {
  const { pathname } = request.nextUrl
  
  const country = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country')
  if (process.env.NODE_ENV === 'production' && country !== 'MX' && country !== 'US') {
    return new NextResponse(
      JSON.stringify({ error: "Búho Rater solo está disponible en México y EE.UU." }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/resenas/:path*',
    '/api/maestros/:path*',
    '/api/profesor/:path*',
    '/api/contador/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}