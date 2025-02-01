'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Character } from '@/types/character'
import { Navbar } from '@/components/Navbar'

export default function CharacterPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [character, setCharacter] = useState<Character | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const { data: character, error } = await supabase
          .from('characters')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        // Check visibility permissions
        if (character.visibility === 'Private' && character.owner_id !== user?.id) {
          toast.error('This character is private')
          router.push('/')
          return
        }

        setCharacter(character)
      } catch (error) {
        console.error('Error fetching character:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCharacter()
  }, [params.id, user, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Character not found</h1>
        <p className="text-muted-foreground">This character may have been deleted or is private.</p>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{character.name}</h1>
          <p className="text-lg text-muted-foreground">{character.tagline}</p>
          
          {/* Character details */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">About</h2>
              <p className="text-muted-foreground">{character.system_prompt}</p>
            </div>

            {/* Tags */}
            {character.tags && character.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {character.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
} 