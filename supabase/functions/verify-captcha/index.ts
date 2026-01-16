import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 1. Estos encabezados son el "pasaporte" para que tu local pueda entrar
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // 2. Responder a OPTIONS de inmediato (Vital para evitar el Failed to fetch)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}));
    
    // 3. Usar variables que Supabase ya tiene inyectadas
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let query = supabase
      .from('maestros')
      .select('id, nombre, foto_url, promedio_calidad, es_colaborador, departamentos(nombre)', { count: 'exact' })

    // Filtros para la UNISON
    if (body.busqueda) {
      const palabras = body.busqueda.trim().split(/\s+/)
      palabras.forEach((p: string) => { query = query.ilike('nombre', `%${p}%`) })
    }

    if (body.depto && body.depto !== 'todos') {
      query = query.ilike('departamentos.nombre', `%${body.depto}%`)
    }

    // Ordenamiento
    const orden = body.orden || 'nombre'
    if (orden === 'mejor') query = query.order('promedio_calidad', { ascending: false, nullsFirst: false })
    else if (orden === 'peor') query = query.order('promedio_calidad', { ascending: true, nullsFirst: false })
    else query = query.order('nombre', { ascending: true })

    const { data, count, error } = await query.range(body.desde || 0, body.hasta || 23)

    if (error) throw error

    return new Response(JSON.stringify({ data, count }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    // 4. Si algo falla, MANDAMOS LOS HEADERS de todos modos
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})