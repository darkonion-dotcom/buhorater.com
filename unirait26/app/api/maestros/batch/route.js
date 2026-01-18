import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { nombres } = await request.json();
    if (!nombres || !Array.isArray(nombres) || nombres.length > 15) {
      return NextResponse.json({ error: 'Solicitud inválida o demasiados nombres' }, { status: 400 });
    }

    const promesasBusqueda = nombres.map(async (nombrePDF) => {
      if (typeof nombrePDF !== 'string') return null;
      const nombreLimpio = nombrePDF.replace(/[%_]/g, '').trim();
      const palabras = nombreLimpio.split(/\s+/);      
      const palabrasClave = palabras.filter(w => w.length > 2);
      const tokensFinales = (palabrasClave.length > 0 ? palabrasClave : palabras).slice(0, 2);

      let query = supabaseAdmin
        .from('maestros')
        .select('*, departamentos(nombre)');

      tokensFinales.forEach(token => {
        query = query.ilike('nombre', `%${token}%`);
      });

      const { data, error } = await query.limit(1);
      
      if (error) {
        console.error("Error en búsqueda individual:", error.message);
        return null;
      }
      
      return data ? data[0] : null;
    });

    const resultados = await Promise.all(promesasBusqueda);
    const encontrados = resultados.filter(Boolean);
    
    const unicos = [...new Map(encontrados.map(item => [item['id'], item])).values()];

    return NextResponse.json(unicos);

  } catch (err) {
    console.error("Falla crítica en Batch API:", err.message);
    return NextResponse.json({ error: 'Error interno del búnker' }, { status: 500 });
  }
}