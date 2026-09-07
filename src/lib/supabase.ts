import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env?.VITE_SUPABASE_URL as string | undefined) ?? '';
const anon = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';

if (!url || !anon) {
  console.warn('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY mancanti: uso placeholder, configura .env (vedi .env.example).');
}

export const isSupabaseConfigured = Boolean(url && anon);

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anon || 'placeholder-anon-key'
);
