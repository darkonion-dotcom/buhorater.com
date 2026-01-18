import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // 1. LIMPIEZA Y LÍMITES DE SEGURIDAD
  const search = searchParams.get('search')?.replace(/[%_]/g, '').trim();
  const depto = searchParams.get('depto');
  const orden = searchParams.get('orden');
  
  // Validamos que la paginación sea razonable
  let desde = Math.max(0, parseInt(searchParams.get('desde')) || 0);
  let hasta = Math.min(desde + 47, parseInt(searchParams.get('hasta')) || desde + 47);

  try {
    // Definimos qué columnas queremos (especificidad = velocidad)
    const columnas = 'id, nombre, foto_url, promedio_calidad, es_colaborador, departamentos(nombre)';
    let query = supabaseAdmin.from('maestros');

    // 2. LÓGICA DE BÚSQUEDA PROTEGIDA
    if (search && search.length >= 3) {
      const palabras = search.split(/\s+/);
      query = query.select(columnas, { count: 'exact' });
      
      palabras.forEach(p => {
        query = query.ilike('nombre', `%${p}%`);
      });

      // En búsquedas, priorizamos colaboradores y limitamos a 50 resultados
      const { data, count, error } = await query
        .order('es_colaborador', { ascending: false })
        .limit(50);

      if (error) throw error;
      return NextResponse.json({ data, count });
    }

    // 3. LÓGICA DE FILTROS DE DEPARTAMENTO
    if (depto && depto !== 'todos') {
      if (depto === '314200') {
        query = query.select(columnas, { count: 'exact' }).eq('departamento_id', 314200);
      } else {
        // Usamos !inner para filtrar por nombre de departamento eficientemente
        query = query.select(columnas.replace('departamentos(', 'departamentos!inner('), { count: 'exact' })
                     .ilike('departamentos.nombre', `%${depto}%`);
      }
    } else {
      query = query.select(columnas, { count: 'exact' });
    }

    // 4. LÓGICA DE ORDENAMIENTO (ELITE)
    if (orden === 'mejor') {
      query = query.order('es_colaborador', { ascending: false })
                   .order('promedio_calidad', { ascending: false, nullsFirst: false });
    } else if (orden === 'peor') {
      query = query.order('promedio_calidad', { ascending: true, nullsFirst: false });
    } else {
      // Por defecto: Alfabético
      query = query.order('nombre', { ascending: true });
    }

    const { data, count, error } = await query.range(desde, hasta);
    
    if (error) throw error;

    return NextResponse.json({ data, count });

  } catch (err) {
    console.error("Error crítico en Búsqueda API:", err.message);
    return NextResponse.json({ error: 'Falla en la consulta del búnker' }, { status: 500 });
  }
}