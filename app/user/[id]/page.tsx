'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { CharacterCard } from '@/components/CharacterCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { ArrowLeft, MessageCircle, Star, Clock, Users, RefreshCw, ChevronRight, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Image from 'next/image'

// Define proper types for the database responses
interface CharacterFromDB {
  id: string
  name: string
  tagline: string | null
  image_url: string | null
  tags: string[] | null
  visibility: string
  nsfw: boolean
}

interface MessageWithCharacter {
  character_id: string
  content: string
  created_at: string
  characters: CharacterFromDB
}

interface ChatHistory {
  character: CharacterFromDB
  message_count: number
  last_message: string
  last_interaction: string
}

interface CreatedCharacter {
  id: string
  name: string
  tagline: string
  image_url: string | null
  avatarUrl?: string
  tags: string[]
  visibility: 'Public' | 'Private'
  created_at: string
  owner_id: string
  owner_name: string
  description?: string
  greeting?: string
  nsfw?: boolean
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalCharacters: 0,
    createdCharacters: 0
  })
  const [createdCharacters, setCreatedCharacters] = useState<CreatedCharacter[]>([])
  const [characters, setCharacters] = useState<CharacterFromDB[]>([])

  const fetchChatHistory = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Fetch user's chat history
      const { data: messages, error: chatError } = await supabase
        .from('messages')
        .select(`
          character_id,
          content,
          created_at,
          characters!inner (
            id,
            name,
            tagline,
            image_url,
            tags,
            visibility,
            nsfw
          )
        `)
        .eq('user_id', params.id)
        .order('created_at', { ascending: false })

      if (chatError) throw chatError

      // Use type assertion with unknown first
      const interactions = (messages as unknown) as MessageWithCharacter[]

      // Process messages to get unique characters and counts
      const characterMap = new Map<string, {
        character: CharacterFromDB,
        count: number,
        lastMessage: string,
        lastTime: string
      }>()

      interactions.forEach(msg => {
        const existing = characterMap.get(msg.character_id)
        if (!existing) {
          characterMap.set(msg.character_id, {
            character: msg.characters,
            count: 1,
            lastMessage: msg.content,
            lastTime: msg.created_at
          })
        } else {
          existing.count++
        }
      })

      // Convert to chat history array
      const processedHistory: ChatHistory[] = Array.from(characterMap.values())
        .map(({ character, count, lastMessage, lastTime }) => ({
          character,
          message_count: count,
          last_message: lastMessage,
          last_interaction: lastTime
        }))
        .sort((a, b) => 
          new Date(b.last_interaction).getTime() - new Date(a.last_interaction).getTime()
        )

      setChatHistory(processedHistory)

      // Calculate total stats
      const totalMessages = processedHistory.length

      setStats({
        totalMessages,
        totalCharacters: processedHistory.length,
        createdCharacters: 0
      })

      // Fetch user's created characters
      const { data: userCharacters, error: charError } = await supabase
        .from('characters')
        .select('*')
        .eq('created_by', params.id)
        .order('created_at', { ascending: false })

      if (charError) throw charError
      setCharacters(userCharacters)

      // Process characters to add proper image URLs
      const charactersWithUrls = userCharacters.map(character => {
        let avatarUrl = null
        if (character.image_url) {
          // Construct the full Supabase storage URL
          avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${character.image_url}`
        }
        return {
          ...character,
          avatarUrl
        }
      })

      // Update stats with created characters count
      setStats(prev => ({
        ...prev,
        createdCharacters: userCharacters.length
      }))

      // Set created characters with their image URLs
      setCreatedCharacters(charactersWithUrls)

    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!params.id) return

    const loadUserProfile = async () => {
      try {
        setIsLoading(true)

        // Fetch user's chat history
        const { data: messages, error: chatError } = await supabase
          .from('messages')
          .select(`
            character_id,
            content,
            created_at,
            characters!inner (
              id,
              name,
              tagline,
              image_url,
              tags,
              visibility,
              nsfw
            )
          `)
          .eq('user_id', params.id)
          .order('created_at', { ascending: false })

        if (chatError) throw chatError

        // Use type assertion with unknown first
        const interactions = (messages as unknown) as MessageWithCharacter[]

        // Process messages to get unique characters and counts
        const characterMap = new Map<string, {
          character: CharacterFromDB,
          count: number,
          lastMessage: string,
          lastTime: string
        }>()

        interactions.forEach(msg => {
          const existing = characterMap.get(msg.character_id)
          if (!existing) {
            characterMap.set(msg.character_id, {
              character: msg.characters,
              count: 1,
              lastMessage: msg.content,
              lastTime: msg.created_at
            })
          } else {
            existing.count++
          }
        })

        // Convert to chat history array
        const processedHistory: ChatHistory[] = Array.from(characterMap.values())
          .map(({ character, count, lastMessage, lastTime }) => ({
            character,
            message_count: count,
            last_message: lastMessage,
            last_interaction: lastTime
          }))
          .sort((a, b) => 
            new Date(b.last_interaction).getTime() - new Date(a.last_interaction).getTime()
          )

        setChatHistory(processedHistory)

        // Fetch user's created characters
        const { data: userCharacters, error: charError } = await supabase
          .from('characters')
          .select('*')
          .eq('created_by', params.id)
          .order('created_at', { ascending: false })

        if (charError) throw charError
        setCharacters(userCharacters)

      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [params.id])

  // Use fetchChatHistory in useEffect
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    if (user?.id !== params.id) {
      router.push(`/user/${user?.id}`)
      return
    }

    if (user) {
      fetchChatHistory()

      // Refresh every 30 seconds if the page is visible
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchChatHistory()
        }
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [user, loading, router, params.id])

  // Now handleRefresh can access fetchChatHistory
  const handleRefresh = () => {
    setIsLoading(true)
    fetchChatHistory()
  }

  if (loading || isLoading) {
    return <LoadingSkeleton />
  }

  if (!user) return null

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-3.5rem)] bg-muted/40">
        <div className="container max-w-6xl py-6 space-y-8">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Profile</h1>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
            </Button>
          </div>

          {/* User Info Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <img 
                src={user.user_metadata.avatar_url} 
                alt={user.user_metadata.full_name}
                className="w-20 h-20 rounded-full ring-2 ring-primary/20"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {user.user_metadata.full_name || 'User'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary/60" />
                    <span className="text-sm">{stats.totalMessages} messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary/60" />
                    <span className="text-sm">{stats.totalCharacters} characters</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Chat History */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Chats</h2>
              {chatHistory.length > 3 && (
                <Link href={`/user/${params.id}/chats`}>
                  {/* <Button variant="ghost" size="sm" className="text-sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button> */}
                  
                </Link>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No chat history yet
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.slice(0, 3).map((chat) => (
                  <Link 
                    key={chat.character.id} 
                    href={`/chat/${chat.character.id}`}
                    className="block"
                  >
                    <Card className="overflow-hidden transition-colors hover:bg-muted/50">
                      <div className="p-4 flex items-center gap-4">
                        {/* Character Avatar */}
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                          {chat.character.image_url ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${chat.character.image_url}`}
                              alt={chat.character.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="text-lg font-semibold">
                                {chat.character.name[0]}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm">
                            {chat.character.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {chat.message_count}
                            </span>
                            <span>•</span>
                            <span>{formatDate(chat.last_interaction)}</span>
                          </div>
                        </div>

                        {/* Arrow Icon */}
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Created Characters Section */}
          {createdCharacters.length > 0 && (
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold">Created Characters</h2>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {createdCharacters.length} characters
                </span>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                {createdCharacters.map((character) => (
                  <Link 
                    key={character.id}
                    href={`/chat/${character.id}`}
                    className="block group"
                  >
                    <Card className="overflow-hidden hover:bg-accent transition-colors">
                      <div className="p-2 sm:p-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        {/* Character Image */}
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-primary/10 overflow-hidden flex-shrink-0">
                          <img 
                            src={character.image_url ? 
                              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${character.image_url}` : 
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}`
                            }
                            alt={character.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}`;
                            }}
                          />
                        </div>

                        {/* Character Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-xs sm:text-sm truncate">
                              {character.name}
                            </h3>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded-full text-[10px]",
                              character.visibility === 'Public' 
                                ? "bg-green-500/10 text-green-500"
                                : "bg-yellow-500/10 text-yellow-500"
                            )}>
                              {character.visibility}
                            </span>
                            {/* Move NSFW badge next to name on mobile */}
                            <div className="sm:hidden">
                              {character.nsfw && (
                                <span className="px-1.5 py-0.5 bg-red-500/10 
                                  text-red-500 text-[10px] rounded-full">
                                  18+
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 line-clamp-1">
                            {character.tagline}
                          </p>
                          {/* Tags */}
                          {character.tags && character.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {character.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={`${character.id}-${tag}`}
                                  className="text-[10px] bg-primary/5 text-primary/80 
                                    px-1.5 py-0.5 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {character.tags.length > 2 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{character.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Stats & Date */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start flex-shrink-0">
                          <div className="text-[10px] text-muted-foreground">
                            Created {formatDate(character.created_at)}
                          </div>
                          {/* Hide NSFW badge on mobile (shown above) */}
                          <div className="hidden sm:block">
                            {character.nsfw && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 bg-red-500/10 
                                text-red-500 text-[10px] rounded-full">
                                18+
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <>
      <Navbar />
      <main className="container py-6 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-lg" />
          ))}
        </div>
      </main>
    </>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
} 