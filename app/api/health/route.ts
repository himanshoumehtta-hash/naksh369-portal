export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function GET() {
  const claudeKey = process.env.CLAUDE_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  return NextResponse.json({
    status: 'ok',
    claude_key_exists: !!claudeKey,
    claude_key_length: claudeKey?.length || 0,
    claude_key_prefix: claudeKey?.substring(0, 20) || 'NOT SET',
    supabase_url_exists: !!supabaseUrl,
  });
}
