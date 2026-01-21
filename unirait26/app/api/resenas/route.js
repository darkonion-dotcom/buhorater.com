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
    
    if (country && country !== 'MX' && country !== 'US') {
      return NextResponse.json({ 
        error: `Lo sentimos, BuhoRater solo está disponible en México y EE.UU. (Detectado: ${country})` 
      }, { status: 403 });
    }

    const body = await request.json();
    const { maestro_id, texto, calidad, dificultad, device_id } = body;

    // 2. EVITAR DUPLICADOS
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
          'x-api-key': process.env.INTERNAL_API_KEY,
        },
        body: JSON.stringify({ texto })
      });

      const rawResponse = await checkIA.text();
      
      try {
        const parsed = JSON.parse(rawResponse);
        if (parsed) aiResult = parsed;
      } catch (jsonError) {
        console.error("Error al parsear JSON de la IA");
      }

    } catch (networkError) {
      console.error("Error de red con la IA");
    }

    const isRejected = 
        (aiResult.decision && aiResult.decision.toUpperCase() === "REJECT") || 
        (aiResult.status && aiResult.status.toLowerCase() === "rejected") || 
        aiResult.is_toxic === true;

    if (isRejected) {
      const mensajesAmigables = {
        "acusacion_delictiva": "Tu reseña contiene acusaciones que requieren canales oficiales. No podemos publicarla por seguridad legal.",
        "vida_personal": "Enfoquémonos en lo académico. Evita comentar sobre la vida privada del profesor.",
        "insulto_grave": "Se detectó lenguaje ofensivo. Mantengamos el respeto en la comunidad.",
        "ataque_identidad": "No permitimos ataques sobre la apariencia o identidad del profesor.",
        "spam": "Tu comentario parece spam o texto sin sentido.",
        "default": "Tu reseña no cumple con las normas de moderación de Búho Rater."
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
    console.error("Error en POST reseñas:", err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}