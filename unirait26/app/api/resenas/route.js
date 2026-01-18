import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const maestroId = searchParams.get('maestro_id');

    if (!maestroId) {
      return NextResponse.json({ error: 'maestro_id no proporcionado' }, { status: 400 });
    }

    const { data: resenas, error } = await supabaseAdmin
      .from('resenas')
      .select('id, texto, calidad, dificultad, created_at')
      .eq('maestro_id', maestroId)
      .order('id', { ascending: false });

    if (error) throw error;
    return NextResponse.json(resenas || []);
  } catch (err) {
    return NextResponse.json({ error: 'Error al cargar reseñas' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json({ error: 'Cuerpo de petición inválido' }, { status: 400 });
    }

    const { maestro_id, texto, calidad, dificultad, captchaToken } = body;

    if (!maestro_id || !texto || !captchaToken) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    if (texto.trim().length < 15) {
      return NextResponse.json({ error: 'La reseña es demasiado corta' }, { status: 400 });
    }

    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${captchaToken}`,
      }
    ).catch(() => null);

    if (!verifyResponse) {
      return NextResponse.json({ error: 'Error de conexión con el verificador' }, { status: 503 });
    }

    const outcome = await verifyResponse.json();
    if (!outcome.success) {
      return NextResponse.json({ error: 'Captcha inválido o expirado' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('resenas')
      .insert([{ 
          maestro_id, 
          texto, 
          calidad: parseInt(calidad), 
          dificultad: parseInt(dificultad) 
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: 'No se pudo procesar la reseña' }, { status: 500 });
  }
}