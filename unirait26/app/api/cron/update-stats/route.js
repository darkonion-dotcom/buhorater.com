import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('No autorizado', { status: 401 });
  }

  try {
    const { error } = await supabase.rpc('actualizar_promedios_maestros');

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Promedios actualizados exitosamente' 
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message }, 
      { status: 500 }
    );
  }
}