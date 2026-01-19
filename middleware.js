import { NextResponse } from 'next/server';

export function middleware(req) {
  const cfCountry = req.headers.get('cf-ipcountry');
  const vercelCountry = req.headers.get('x-vercel-ip-country');
  const ip = req.headers.get('x-forwarded-for') || req.ip;

  console.log(`--- INTENTO DE ACCESO ---`);
  console.log(`Ruta: ${req.nextUrl.pathname}`);
  console.log(`IP detectada: ${ip}`);
  console.log(`Pais Cloudflare (cf-ipcountry): ${cfCountry}`);
  console.log(`Pais Vercel (x-vercel-ip-country): ${vercelCountry}`);
  console.log(`-------------------------`);


  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};