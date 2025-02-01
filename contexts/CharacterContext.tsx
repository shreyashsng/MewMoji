'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Character, CharacterContextType } from '@/types/character'

export const CharacterContext = createContext<CharacterContextType>({
  character: null,
  avatarUrl: null,
  loadCharacter: async () => {},
  updateCharacter: async () => {},
  updateAvatar: async () => {},
  setCharacter: async () => ({} as Character)
})

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [character, setCharacterState] = useState<Character | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const loadCharacter = useCallback(async (id: string) => {
    try {
      console.log('Loading character with ID:', id) // Debug log
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error loading character:', error)
        return
      }

      if (!data) {
        console.error('No character found with ID:', id)
        return
      }

      setCharacterState(data)

      // Only get public URL if image_url exists and is not empty
      if (data.image_url) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.image_url)
        setAvatarUrl(publicUrl)
      } else {
        // Reset avatar URL if no image
        setAvatarUrl(null)
      }
    } catch (error) {
      console.error('Error in loadCharacter:', error)
    }
  }, [])

  const updateCharacter = useCallback(async (id: string, updates: Partial<Character>) => {
    const { error } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating character:', error)
      return
    }

    setCharacterState(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  const updateAvatar = async (characterId: string, file: File) => {
    try {
      const fileName = `${characterId}/${Date.now()}.png`
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        })

      if (uploadError) throw uploadError

      // Update character with new image_url
      await updateCharacter(characterId, {
        image_url: fileName
      })

      // Refresh the character data
      await loadCharacter(characterId)
    } catch (error) {
      console.error('Error updating avatar:', error)
      throw error
    }
  }

  const setCharacter = useCallback(async (newCharacter: Character) => {
    try {
      // Insert the character into the database
      const { data, error } = await supabase
        .from('characters')
        .insert([newCharacter])
        .select()
        .single()

      if (error) throw error

      // Update local state
      setCharacterState(data)
      return data
    } catch (error) {
      console.error('Error setting character:', error)
      throw error
    }
  }, [])

  // Subscribe to real-time changes
  useEffect(() => {
    if (!character?.id) return

    const subscription = supabase
      .channel(`character-${character.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'characters',
        filter: `id=eq.${character.id}`
      }, payload => {
        setCharacterState(payload.new as Character)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [character?.id])

  return (
    <CharacterContext.Provider value={{
      character,
      avatarUrl,
      loadCharacter,
      updateCharacter,
      updateAvatar,
      setCharacter
    }}>
      {children}
    </CharacterContext.Provider>
  )
}

export const useCharacter = () => useContext(CharacterContext) 