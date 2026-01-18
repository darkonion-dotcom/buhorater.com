import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const revalidate = 1800; 

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    const { data: profe, error } = await supabaseAdmin
      .from('maestros')
      .select(`
        id, 
        nombre, 
        foto_url, 
        promedio_calidad, 
        promedio_dificultad, 
        total_resenas, 
        es_colaborador, 
        departamentos(nombre)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!profe) {
      return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
    }

    return NextResponse.json(profe, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=59'
      }
    });

  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}