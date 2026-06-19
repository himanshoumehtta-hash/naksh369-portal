import { supabaseAdmin } from './supabase';
import { NextResponse } from 'next/server';

interface AuthResult {
  user: { id: string; email?: string } | null;
  error: NextResponse | null;
}

export async function getAuthUser(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      error: NextResponse.json({ success: false, message: 'Unauthorized — no token' }, { status: 401 }),
    };
  }

  const token = authHeader.slice(7);

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return {
      user: null,
      error: NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 }),
    };
  }

  return { user: data.user, error: null };
}

export async function requireAdmin(request: Request): Promise<AuthResult> {
  const { user, error } = await getAuthUser(request);
  if (error || !user) return { user: null, error };

  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'admin') {
    return {
      user: null,
      error: NextResponse.json({ success: false, message: 'Access denied — admin only' }, { status: 403 }),
    };
  }

  return { user, error: null };
}
