import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno de Supabase");
}

const supabaseAdmin = createClient(
  supabaseUrl || "",
  supabaseKey || ""
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const maestro_id = searchParams.get('maestro_id');
    
    if (!maestro_id) return NextResponse.json([], { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('resenas')
      .select('*')
      .eq('maestro_id', maestro_id)
      .eq('aprobada', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: 'Error al obtener reseñas' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const country = request.headers.get('x-vercel-ip-country');
    
    if (country && country !== 'MX') {
      return NextResponse.json({ 
        error: `Lo sentimos, BuhoRater solo está disponible en México. (Detectado: ${country})` 
      }, { status: 403 });
    }

    const body = await request.json();
    const { maestro_id, texto, calidad, dificultad, device_id } = body;

    const { data: existente } = await supabaseAdmin
      .from('resenas')
      .select('id')
      .eq('maestro_id', maestro_id)
      .eq('device_id', device_id)
      .limit(1);

    if (existente && existente.length > 0) {
      return NextResponse.json({ error: 'Ya has enviado una reseña para este maestro.' }, { status: 403 });
    }

    let aiResult = { decision: "PASS", is_toxic: false, motivos: [] }; 

    try {
      const checkIA = await fetch("https://buhorater-backend.onrender.com/verificar-resena", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': process.env.INTERNAL_API_KEY || ""
        },
        body: JSON.stringify({ texto })
      });

      const rawResponse = await checkIA.text();
      
      try {
        const parsed = JSON.parse(rawResponse);
        if (parsed) aiResult = parsed;
      } catch (jsonError) {
        // Se permite el paso si falla el JSON
      }

    } catch (networkError) {
      // Se permite el paso si falla la red
    }

    const isRejected = 
        (aiResult.decision && aiResult.decision.toUpperCase() === "REJECT") || 
        (aiResult.status && aiResult.status.toLowerCase() === "rejected") || 
        aiResult.is_toxic === true;

    if (isRejected) {
      const mensajesAmigables = {
        "acusacion_delictiva": "Tu reseña contiene acusaciones graves (acoso, delitos) que no podemos publicar por seguridad legal.",
        "vida_personal": "Por favor enfócate en lo académico. Evita comentar sobre la vida privada, familia o pareja del profesor.",
        "insulto_grave": "Se detectaron insultos ofensivos o lenguaje de odio. Mantengamos el respeto.",
        "ataque_identidad": "No permitimos ataques sobre la apariencia física, orientación sexual o identidad del profesor.",
        "spam": "Tu comentario parece spam o no tiene contenido relevante.",
        "default": "Tu reseña no cumple con las normas de la comunidad de BuhoRater."
      };

      const motivoDetectado = (aiResult.motivos && aiResult.motivos.length > 0) ? aiResult.motivos[0] : "default";
      const mensajeError = mensajesAmigables[motivoDetectado] || mensajesAmigables["default"];

      return NextResponse.json({ error: mensajeError }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin.from('resenas').insert([{ 
      maestro_id, 
      texto, 
      calidad: parseInt(calidad), 
      dificultad: parseInt(dificultad), 
      device_id, 
      aprobada: true 
    }]);

    if (insertError) {
      if (insertError.code === '23505') { 
        return NextResponse.json({ error: 'Ya has enviado una reseña para este maestro.' }, { status: 409 });
      }
      throw insertError;
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}