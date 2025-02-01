'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/contexts/AuthContext'
import type { Character } from '@/types/character'

function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getRandomColor(name: string) {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ]
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

interface CharacterCardProps {
  character: Character
  isOwner?: boolean
}

export function CharacterCard({ character, isOwner }: CharacterCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const initials = getInitials(character.name)
  const bgColor = getRandomColor(character.name)

  useEffect(() => {
    // Get character's avatar using stored image_url
    if (character.image_url) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(character.image_url)
      setAvatarUrl(publicUrl)
    }

    // Get message count for this specific character's chats
    async function fetchMessageCount() {
      try {
        // First get all messages for this character's chats
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', character.id)

        if (error) {
          console.error('Error fetching messages for character:', character.id, error)
          return
        }

        setMessageCount(count || 0)
        setIsLoaded(true)

        // Subscribe to changes
        const subscription = supabase
          .channel(`messages-${character.id}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${character.id}`
          }, () => {
            // Refetch count when messages change
            fetchMessageCount()
          })
          .subscribe()

        return () => {
          subscription.unsubscribe()
        }

      } catch (err) {
        console.error('Error in fetchMessageCount:', err)
        setIsLoaded(true)
      }
    }

    fetchMessageCount()
  }, [character.id, character.image_url])

  // Prefetch the chat route
  useEffect(() => {
    if (character?.id) {
      router.prefetch(`/chat/${character.id}`)
    }
  }, [character?.id, router])

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent default link behavior
    
    if (!user) {
      setShowAuthModal(true)
      return
    }
    
    router.push(`/chat/${character.id}`)
  }

  if (!character?.id) return null

  return (
    <div className="relative group">
      <Card className="group/card overflow-hidden transition-all hover:shadow-lg">
        <div className="relative h-full">
          {/* Character Link - Wraps most of the content */}
          <a 
            href={`/chat/${character.id}`}
            onClick={handleCardClick}
            className="block h-full"
          >
            <div className="p-3 sm:p-4 space-y-3">
              {/* Avatar Section */}
              <div className="flex items-start gap-3">
                <div className="relative w-full pt-[75%] sm:pt-[100%] overflow-hidden">
                  <div className="absolute inset-0">
                    {avatarUrl ? (
                      <div className="relative w-full h-full">
                        <div 
                          className="absolute inset-0 blur-lg scale-110 bg-cover"
                          style={{ backgroundImage: `url(${avatarUrl})` }}
                        />
                        <img
                          src={avatarUrl}
                          alt={`${character.name}'s avatar`}
                          className="relative w-full h-full object-cover transition-transform duration-300 
                            group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${bgColor} 
                        transition-transform duration-300 group-hover:scale-105`}>
                        <span className="text-4xl font-bold text-white">
                          {initials}
                        </span>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent 
                      to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* NSFW badge */}
                    {character.nsfw && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-500/90 text-white text-[10px] px-2 py-0.5 
                          rounded-full font-medium shadow-sm">
                          18+
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Character Info */}
              <div>
                <h3 className="font-semibold text-sm sm:text-base truncate">
                  {character.name}
                </h3>
                <p className="text-xs text-muted-foreground/90 truncate mt-0.5">
                  {character.tagline || ''}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground/80 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                {character.description || character.greeting}
              </p>

              {/* Tags */}
              {character.tags && character.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {character.tags.slice(0, 3).map((tag) => (
                    <span
                      key={`${character.id}-${tag}`}
                      className="text-[9px] sm:text-[10px] bg-primary/10 text-primary 
                        px-1.5 sm:px-2 py-0.5 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {character.tags.length > 3 && (
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground/80 
                      font-medium">
                      +{character.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </a>

          {/* Footer - Outside the character link */}
          <div className="p-3 pt-0">
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <div className="flex items-center gap-2 relative">
                {/* User Link */}
                {character.owner_name ? (
                  <Link 
                    href={`/user/${character.owner_id}`}
                    className="text-[10px] sm:text-xs font-semibold hover:text-primary transition-colors z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {character.owner_name}
                  </Link>
                ) : (
                  <span className="text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                    MewMoji
                  </span>
                )}

                {/* Creator Info Tooltip */}
                {character.owner_name && (
                  <div className="absolute bottom-full left-0 mb-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1.5 text-[10px] whitespace-nowrap bg-background/95 backdrop-blur-sm p-1.5 rounded-md shadow-sm border border-border/50">
                      <span className="w-3.5 h-3.5">
                        <svg viewBox="0 0 24 24" className="text-primary/60">
                          <path 
                            fill="currentColor" 
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                          />
                        </svg>
                      </span>
                      <span>Created by</span>
                      <span className="font-medium text-primary">
                        {character.owner_name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Count */}
              <div className="flex items-center gap-1.5 text-muted-foreground/80">
                <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-[10px] sm:text-xs font-medium">
                  {messageCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </div>
  )
} 