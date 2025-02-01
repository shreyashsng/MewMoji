import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = 'https://ghnwnjjupgstmsvuddck.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdobnduamp1cGdzdG1zdnVkZGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MTkzNzUsImV4cCI6MjA1MzQ5NTM3NX0.CWfENo2KN6T7moA6YIxSr7dsMKaLGsNUH9ivEEN-YU4'

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public'
    }
  }
) 