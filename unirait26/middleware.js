import { NextResponse } from 'next/server'

const rateLimitMap = new Map()

export function proxy(request) {
  const { pathname } = request.nextUrl
  
  // CAMBIO: Se eliminó "|| 'MX'". Si no hay header, no entra.
  const country = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country')

  // Si country es null, undefined o cualquier cosa que no sea 'MX', bloquea.
  if (process.env.NODE_ENV === 'production' && country !== 'MX') {
    return new NextResponse(
      JSON.stringify({ error: "Búho Rater solo está disponible para estudiantes en México." }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (pathname.startsWith('/api/')) {
    // También quitamos la asunción de localhost en producción si prefieres ser estricto
    // (Aunque para rate-limit se recomienda tener un valor fallback para que no truene el Map)
    const ip = request.headers.get('cf-connecting-ip') || request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    const ahora = Date.now()
    const ventanaTiempo = 10000 
    const limitePeticiones = 15 

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { cuenta: 1, inicio: ahora })
      return NextResponse.next()
    }

    const registro = rateLimitMap.get(ip)

    if (ahora - registro.inicio > ventanaTiempo) {
      registro.cuenta = 1
      registro.inicio = ahora
      return NextResponse.next()
    }

    if (registro.cuenta >= limitePeticiones) {
      return new NextResponse(
        JSON.stringify({ error: "Demasiadas peticiones. Intenta de nuevo en 10 segundos." }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    registro.cuenta++
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