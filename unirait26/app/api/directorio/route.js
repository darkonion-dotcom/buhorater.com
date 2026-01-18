import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
export const revalidate = 3600;

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    let todos = [];
    let desde = 0;
    const paso = 1000;
    let hayMas = true;
    while (hayMas) {
      const hasta = desde + paso - 1;
      const { data, error } = await supabaseAdmin
        .from('maestros')
        .select('id, nombre')
        .order('nombre', { ascending: true })
        .range(desde, hasta);

      if (error) throw error;
      
      if (data && data.length > 0) {
        todos = todos.concat(data);
        desde += paso;
      }
      
      if (!data || data.length < paso) hayMas = false;
    }
    return NextResponse.json(todos, {
        headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59'
        }
    });

  } catch (err) {
    console.error("Falla en el motor del directorio:", err.message);
    return NextResponse.json({ error: 'Error en el búnker' }, { status: 500 });
  }
}