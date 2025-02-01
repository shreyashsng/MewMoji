'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCharacter } from '@/contexts/CharacterContext'
import ChatInterface from '@/components/ChatInterface'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ClientWrapper } from '@/components/ClientWrapper'

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { character, loadCharacter } = useCharacter()
  const [isLoading, setIsLoading] = useState(true)
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    const initChat = async () => {
      if (!params.id) return

      try {
        // First check if character exists and is accessible
        const { data: characterData, error } = await supabase
          .from('characters')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        // Check visibility permissions
        if (characterData.visibility === 'Private') {
          if (!user) {
            setIsPrivate(true)
            setIsLoading(false)
            return
          }
          if (characterData.owner_id !== user.id) {
            toast.error('This character is private')
            router.push('/')
            return
          }
        }

        // Load character into context
        await loadCharacter(params.id)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading character:', error)
        toast.error('Character not found')
        router.push('/')
      }
    }

    initChat()
  }, [params.id, loadCharacter, router, user])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  // Show login prompt for private characters
  if (isPrivate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold">Private Character</h1>
        <p className="text-muted-foreground mb-4">
          This character is private. Please log in to continue.
        </p>
        <Link href={`/login?redirect=/chat/${params.id}`}>
          <Button>Log in to Continue</Button>
        </Link>
      </div>
    )
  }

  if (!character) return null

  return (
    <ClientWrapper>
      <main className="min-h-screen bg-background">
        <ChatInterface characterId={params.id} />
      </main>
    </ClientWrapper>
  )
} 