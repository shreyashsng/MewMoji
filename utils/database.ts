import { supabase } from '@/lib/supabase'

export async function updateMessageCount(characterId: string) {
  try {
    const { error } = await supabase.rpc('increment_message_count', {
      char_id: characterId
    })
    
    if (error) throw error
  } catch (error) {
    console.error('Error updating message count:', error)
  }
} 