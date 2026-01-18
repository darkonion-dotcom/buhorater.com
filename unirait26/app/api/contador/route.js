import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
export const revalidate = 60;
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from('resenas')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    const conteoReal = (count || 0) + 1500; 

    return NextResponse.json({ count: conteoReal });

  } catch (err) {
    console.error("Error en el contador del búnker:", err);
    return NextResponse.json({ count: 0, error: "Error de conteo" }, { status: 500 });
  }
}