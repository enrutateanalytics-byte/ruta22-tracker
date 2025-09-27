import { createClient } from '@supabase/supabase-js'

// In Lovable's Supabase integration, these variables are available without VITE_ prefix
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Available env vars:', Object.keys(import.meta.env))
  throw new Error('Missing Supabase environment variables. Please ensure Supabase is connected in your project settings.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)