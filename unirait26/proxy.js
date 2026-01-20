import { NextResponse } from 'next/server'

export function proxy(request) {
  const { pathname } = request.nextUrl
  
  // 1. Capturamos los headers para ver qué está llegando
  const cfCountry = request.headers.get('cf-ipcountry')
  const vercelCountry = request.headers.get('x-vercel-ip-country')
  
  // 2. Decidimos el país final (Si no hay nada, ponemos 'DESCONOCIDO')
  const country = cfCountry || vercelCountry || 'DESCONOCIDO'

  // 3. LOGICA DE BLOQUEO (MX y US permitidos)
  if (process.env.NODE_ENV === 'production' && country !== 'MX' && country !== 'US') {
    return new NextResponse(
      JSON.stringify({ 
        error: "Acceso denegado por geolocalización.",
        debug_info: {
          pais_detectado: country,
          fuente_cf: cfCountry || "vacio",
          fuente_vercel: vercelCountry || "vacio"
        }
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Rate Limit (Simplificado para que no estorbe ahora)
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