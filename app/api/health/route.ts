export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { error } = await supabaseAdmin.from('users').select('id').limit(1);
    return NextResponse.json({
      success: true,
      message: 'API is healthy',
      db: error ? 'error' : 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'API error' }, { status: 500 });
  }
}
