'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Persona } from '@/types/persona'
import { toast } from 'sonner'

type PersonaContextType = {
  personas: Persona[]
  currentPersona: Persona | null
  loadPersonas: () => Promise<void>
  createPersona: (data: Partial<Persona>) => Promise<Persona>
  updatePersona: (id: string, data: Partial<Persona>) => Promise<void>
  deletePersona: (id: string) => Promise<void>
  setCurrentPersona: (persona: Persona | null) => void
  isLoading: boolean
}

const PersonaContext = createContext<PersonaContextType>({} as PersonaContextType)

interface PersonaUpdate {
  name?: string
  avatar_url?: string | null
  // Add other updatable fields
}

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadPersonas = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: personas, error } = await supabase
        .from('personas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPersonas(personas || [])
    } catch (error) {
      console.error('Error loading personas:', error)
      toast.error('Failed to load personas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createPersona = useCallback(async (data: Partial<Persona>) => {
    try {
      const { data: persona, error } = await supabase
        .from('personas')
        .insert([data])
        .select()
        .single()

      if (error) throw error
      setPersonas(prev => [persona, ...prev])
      return persona
    } catch (error) {
      console.error('Error creating persona:', error)
      throw error
    }
  }, [])

  const updatePersona = useCallback(async (id: string, data: PersonaUpdate) => {
    try {
      const { data: updatedPersona, error } = await supabase
        .from('personas')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setPersonas(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
      return updatedPersona
    } catch (error) {
      console.error('Error updating persona:', error)
      throw error
    }
  }, [])

  const deletePersona = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('personas')
        .delete()
        .eq('id', id)

      if (error) throw error
      setPersonas(prev => prev.filter(p => p.id !== id))
      if (currentPersona?.id === id) setCurrentPersona(null)
    } catch (error) {
      console.error('Error deleting persona:', error)
      throw error
    }
  }, [currentPersona])

  return (
    <PersonaContext.Provider value={{
      personas,
      currentPersona,
      loadPersonas,
      createPersona,
      updatePersona,
      deletePersona,
      setCurrentPersona,
      isLoading
    }}>
      {children}
    </PersonaContext.Provider>
  )
}

export const usePersona = () => useContext(PersonaContext) 