import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co') &&
    supabaseAnonKey.length > 20 &&
    !supabaseUrl.includes('your-project')
  );
};

export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl || '',
    hasKey: Boolean(supabaseAnonKey && !supabaseAnonKey.includes('your-anon-public-key')),
    isConfigured: isSupabaseConfigured(),
  };
};

let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    clientInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('Falha ao inicializar cliente Supabase:', err);
    clientInstance = null;
  }
}

export const supabase = clientInstance;
