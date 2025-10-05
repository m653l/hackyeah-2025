import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Data collection will be disabled.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: false, // Brak autoryzacji
    autoRefreshToken: false,
  }
})

// Sprawdzenie połączenia z Supabase
export const testSupabaseConnection = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return false
    }
    
    const { data, error } = await supabase
      .from('user_simulations')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.warn('Supabase connection test failed:', error.message)
      return false
    }
    
    console.log('Supabase connection successful')
    return true
  } catch (error) {
    console.warn('Supabase connection error:', error)
    return false
  }
}