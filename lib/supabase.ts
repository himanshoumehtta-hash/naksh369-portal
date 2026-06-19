import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qlhudtiyjbxchzeqvbvi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaHVkdGl5amJ4Y2h6ZXF2YnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTc0OTUsImV4cCI6MjA5NjY3MzQ5NX0.R508oWtbrJtN6QvoGCovQTuLee1tyozOVvQijSkpyeY';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaHVkdGl5amJ4Y2h6ZXF2YnZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA5NzQ5NSwiZXhwIjoyMDk2NjczNDk1fQ.hYksiCIQj0KUkwgjxMcpMXZRcp-ticAl5AZ0Kieodro';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
