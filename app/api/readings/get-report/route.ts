export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { readingId } = await request.json();
    if (!readingId) {
      return NextResponse.json({ success: false, message: 'readingId required' }, { status: 400 });
    }

    const { data: blueprint, error } = await supabaseAdmin
      .from('blueprints')
      .select('content_html, pdf_url')
      .eq('reading_id', readingId)
      .single();

    if (error || !blueprint) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      content_html: blueprint.content_html,
      pdf_url: blueprint.pdf_url,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
