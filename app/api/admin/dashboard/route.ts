-e export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { error: authError } = await requireAdmin(request);
    if (authError) return authError;

    // Get ALL readings with profiles (bypass RLS using admin client)
    const { data: readings } = await supabaseAdmin
      .from('readings')
      .select('*, client_profiles(*), blueprints(pdf_url, generation_status)')
      .order('created_at', { ascending: false })
      .limit(100);

    // Get ALL users count
    const { count: userCount } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true });

    // Status counts
    const allReadings = readings || [];
    const stats = {
      total_readings: allReadings.length,
      pending: allReadings.filter(r => r.status === 'pending').length,
      approved: allReadings.filter(r => r.status === 'approved').length,
      processing: allReadings.filter(r => r.status === 'processing').length,
      delivered: allReadings.filter(r => r.status === 'delivered').length,
      total_users: userCount || 0,
    };

    // Get user info for each reading
    const userIds = [...new Set(allReadings.map(r => r.user_id).filter(Boolean))];
    
    let userMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, email, first_name, whatsapp_number')
        .in('id', userIds);
      
      userMap = Object.fromEntries((users || []).map(u => [u.id, u]));
    }

    // Also get emails from auth.users for users not in public.users
    const enrichedReadings = allReadings.map(r => ({
      ...r,
      user_info: userMap[r.user_id] || { email: 'Unknown', first_name: 'Unknown' },
    }));

    return NextResponse.json({
      success: true,
      data: { stats, readings: enrichedReadings },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
