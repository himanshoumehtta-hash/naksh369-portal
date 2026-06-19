export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { readingId, action } = await request.json();

    if (!readingId || !action) {
      return NextResponse.json({ success: false, message: 'readingId and action required' }, { status: 400 });
    }

    if (action === 'approve') {
      await supabaseAdmin.from('readings').update({ status: 'approved' }).eq('id', readingId);
      return NextResponse.json({ success: true, message: 'Reading approved. You can now generate the blueprint.' });
    }

    if (action === 'reject') {
      await supabaseAdmin.from('readings').update({ status: 'rejected' }).eq('id', readingId);
      return NextResponse.json({ success: true, message: 'Reading rejected.' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action. Use "approve" or "reject".' }, { status: 400 });
  } catch (error) {
    console.error('Approve error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
