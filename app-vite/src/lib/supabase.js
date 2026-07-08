import { createClient } from '@supabase/supabase-js';

// Clé anon publique (protégée par RLS côté Supabase) — identique à l'app actuelle.
const SUPABASE_URL = 'https://qlukumjqgagrukbavtvg.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdWt1bWpxZ2FncnVrYmF2dHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTk5NTEsImV4cCI6MjA5Mjc5NTk1MX0.fOgW1587adYgOUb2n3_0E-8XOYgOJNOI9b3bJ3VJRLs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'fs_sb_session' },
});

export { SUPABASE_URL, SUPABASE_ANON_KEY };
