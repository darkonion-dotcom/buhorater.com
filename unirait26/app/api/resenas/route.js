import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// --------------------------------------------------------------------------
// 1. Configuración Segura de Supabase
// --------------------------------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("🚨 ERROR CRÍTICO: Faltan las variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
}

// Inicialización segura
const supabaseAdmin = createClient(
  supabaseUrl || "",
  supabaseKey || ""
);

// --------------------------------------------------------------------------
// 2. Endpoint GET (Obtener reseñas)
// --------------------------------------------------------------------------
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
    console.error("Error en GET:", err);
    return NextResponse.json({ error: 'Error al obtener reseñas' }, { status: 500 });
  }
}

// --------------------------------------------------------------------------
// 3. Endpoint POST (Crear reseña con Moderación Inteligente)
// --------------------------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();
    const { maestro_id, texto, calidad, dificultad, device_id } = body;

    console.log("📦 INTENTO DE RESEÑA RECIBIDO:", { maestro_id, texto });

    // A. Bloqueo de duplicados (Preventivo)
    const { data: existente } = await supabaseAdmin
      .from('resenas')
      .select('id')
      .eq('maestro_id', maestro_id)
      .eq('device_id', device_id)
      .limit(1);

    if (existente && existente.length > 0) {
      return NextResponse.json({ error: 'Ya has enviado una reseña para este maestro.' }, { status: 403 });
    }

    // B. Moderación con BuhoAI
    // Inicializamos con "motivos: []" y decision "PASS" por seguridad
    let aiResult = { decision: "PASS", is_toxic: false, motivos: [] }; 

    console.log("📡 Enviando a analizar:", texto);
    
    try {
      // Nota: Asegúrate que la URL sea minúscula "/verificar-resena" para coincidir con Python
      const checkIA = await fetch("https://buhorater-backend.onrender.com/verificar-resena", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': process.env.INTERNAL_API_KEY || ""
        },
        body: JSON.stringify({ texto })
      });

      // Leer como texto primero para evitar errores de parseo si devuelve HTML
      const rawResponse = await checkIA.text();
      
      try {
        const parsed = JSON.parse(rawResponse);
        if (parsed) aiResult = parsed;
      } catch (jsonError) {
        console.error("⚠️ La IA devolvió algo que no es JSON (probablemente error de servidor). Se permite el paso.");
      }

    } catch (networkError) {
      console.error("❌ ERROR DE CONEXIÓN CON BUHOAI:", networkError);
      // Si la IA está caída, dejamos pasar el comentario (Fail Open)
    }

    // C. Decisión de Moderación (Híbrida: entiende formato nuevo y viejo)
    const isRejected = 
        (aiResult.decision && aiResult.decision.toUpperCase() === "REJECT") || 
        (aiResult.status && aiResult.status.toLowerCase() === "rejected") || 
        aiResult.is_toxic === true;

    console.log("🧐 Resultado IA:", aiResult, " -> ¿Rechazado?:", isRejected);

    if (isRejected) {
      // --- TRADUCTOR DE MOTIVOS PARA EL USUARIO ---
      const mensajesAmigables = {
        "acusacion_delictiva": "Tu reseña contiene acusaciones graves (acoso, delitos) que no podemos publicar por seguridad legal.",
        "vida_personal": "Por favor enfócate en lo académico. Evita comentar sobre la vida privada, familia o pareja del profesor.",
        "insulto_grave": "Se detectaron insultos ofensivos o lenguaje de odio. Mantengamos el respeto.",
        "ataque_identidad": "No permitimos ataques sobre la apariencia física, orientación sexual o identidad del profesor.",
        "spam": "Tu comentario parece spam o no tiene contenido relevante.",
        "default": "Tu reseña no cumple con las normas de la comunidad de BuhoRater."
      };

      // Tomamos el primer motivo que nos dio la IA, o usamos default
      const motivoDetectado = (aiResult.motivos && aiResult.motivos.length > 0) ? aiResult.motivos[0] : "default";
      const mensajeError = mensajesAmigables[motivoDetectado] || mensajesAmigables["default"];

      return NextResponse.json({ error: mensajeError }, { status: 400 });
    }

    // D. Inserción final en Supabase
    const { error: insertError } = await supabaseAdmin.from('resenas').insert([{ 
      maestro_id, 
      texto, 
      calidad: parseInt(calidad), 
      dificultad: parseInt(dificultad), 
      device_id, 
      aprobada: true 
    }]);

    if (insertError) {
      console.error("❌ Error insertando en Supabase:", insertError);
      // Código 23505 es violación de unicidad en Postgres
      if (insertError.code === '23505') { 
        return NextResponse.json({ error: 'Ya has enviado una reseña para este maestro.' }, { status: 409 });
      }
      throw insertError;
    }

    console.log("✅ Reseña guardada con éxito.");
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ Error interno general:", err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}