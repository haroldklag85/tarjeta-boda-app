import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

let client: any;

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
  console.warn('Supabase credentials missing or invalid. Using fallback mock client.');
  
  // Safe mock fallback to prevent initialization crashes
  client = new Proxy({} as any, {
    get(_, prop) {
      if (prop === 'auth') {
        return {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        };
      }
      return () => ({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
              maybeSingle: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
              order: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') })
            }),
            order: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') })
          }),
          insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          update: () => ({
            eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
          })
        })
      });
    }
  });
} else {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;
