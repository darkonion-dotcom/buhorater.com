import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    
    if (!body || !body.texto) {
      return NextResponse.json({ error: "Texto requerido" }, { status: 400 });
    }

    const { texto } = body;

    const res = await fetch("https://tu-proyecto-en-render.onrender.com/verificar-resena", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.INTERNAL_API_KEY
      },
      body: JSON.stringify({ texto }),
      cache: 'no-store'
    }).catch(() => null);

    if (!res) {
      return NextResponse.json({ 
        error: "El servidor de seguridad está iniciando. Reintenta en unos segundos." 
      }, { status: 503 });
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json({ 
        error: "Error en el formato de respuesta del servidor." 
      }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    return NextResponse.json({ 
      error: "Error interno en el puente de verificación." 
    }, { status: 500 });
  }
}