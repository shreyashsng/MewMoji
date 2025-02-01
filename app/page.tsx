'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CharacterCard } from '@/components/CharacterCard'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Navbar } from '@/components/Navbar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientWrapper } from '@/components/ClientWrapper'
import NoSSR from '@/components/NoSSR'

type Character = Database['public']['Tables']['characters']['Row']

const ITEMS_PER_PAGE = 30 // 6 rows × 5 cards

export default function Home() {
  return (
    <NoSSR>
      <HomePage />
    </NoSSR>
  )
}

function HomePage() {
  const { user } = useAuth()
  const [allCharacters, setAllCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Memoize unique tags
  const uniqueTags = useMemo(() => {
    const tags = allCharacters.flatMap(char => char.tags || [])
    return Array.from(new Set(tags))
  }, [allCharacters])

  // Memoize filtered characters
  const filteredCharacters = useMemo(() => {
    let filtered = allCharacters
    if (selectedTag) {
      filtered = filtered.filter(char => char.tags?.includes(selectedTag))
    }
    return filtered
  }, [allCharacters, selectedTag])

  // Calculate total pages
  const totalPages = Math.ceil(filteredCharacters.length / ITEMS_PER_PAGE)

  // Get current page characters
  const currentCharacters = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredCharacters.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredCharacters, currentPage])

  // Load characters with caching
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        // Check cache first
        const cachedData = sessionStorage.getItem('characters')
        const cachedTimestamp = sessionStorage.getItem('charactersTimestamp')
        
        // Use cache if it's less than 5 minutes old
        if (cachedData && cachedTimestamp && 
            Date.now() - parseInt(cachedTimestamp) < 5 * 60 * 1000) {
          setAllCharacters(JSON.parse(cachedData))
          setLoading(false)
          setInitialLoadComplete(true)
          return
        }

        let query = supabase
          .from('characters')
          .select('*')
          .order('created_at', { ascending: false }) // Sort by creation date, newest first

        // If user is not logged in, only show public characters
        if (!user) {
          query = query.eq('visibility', 'Public')
        } else {
          // If user is logged in, show:
          // 1. All public characters
          // 2. Their own private characters
          query = query.or(`visibility.eq.Public,owner_id.eq.${user.id}`)
        }

        const { data, error } = await query

        if (error) throw error

        setAllCharacters(data || [])
        
        // Cache the results
        sessionStorage.setItem('characters', JSON.stringify(data))
        sessionStorage.setItem('charactersTimestamp', Date.now().toString())

      } catch (error) {
        console.error('Error loading characters:', error)
      } finally {
        setLoading(false)
        setInitialLoadComplete(true)
      }
    }

    if (!initialLoadComplete) {
      loadCharacters()
    }
  }, [user, initialLoadComplete])

  // Subscribe to real-time updates only after initial load
  useEffect(() => {
    if (!initialLoadComplete) return

    const subscription = supabase
      .channel('characters-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'characters' 
        }, 
        () => {
          // Invalidate cache
          sessionStorage.removeItem('characters')
          sessionStorage.removeItem('charactersTimestamp')
          // Reload data
          setInitialLoadComplete(false)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [initialLoadComplete])

  // Extract unique tags from all characters (this will update automatically when allCharacters changes)
  const allTags = useMemo(() => {
    const tagSet = new Set(allCharacters.flatMap(char => char.tags || []))
    return Array.from(tagSet).sort()
  }, [allCharacters])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth / 2 // Scroll half the visible width
      
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  // Update checkArrows to run on mount and when tags change
  const checkArrows = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      setShowLeftArrow(container.scrollLeft > 0)
      setShowRightArrow(
        container.scrollLeft < (container.scrollWidth - container.clientWidth - 5) // Added small buffer
      )
    }
  }, [])

  // Run checkArrows when tags load
  useEffect(() => {
    checkArrows()
  }, [allTags, checkArrows])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton 
                key={i}
                className="w-full aspect-[3/4] rounded-lg"
              />
            ))}
          </div>
        </main>
      </>
    )
  }

  return (
    <ClientWrapper>
      <Navbar />
      <main className="flex-1">
        <div className="container py-6 space-y-8">
          {/* Tags ScrollArea with Gradient Edges */}
          <div className="relative group">
            {/* Left Gradient + Arrow */}
            <div 
              className={cn(
                "absolute left-0 top-0 bottom-0 flex items-center z-20 transition-opacity duration-200",
                showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 ml-2 rounded-full bg-background/95 shadow-md hover:bg-accent relative z-30"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Tags Container */}
            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide px-4 py-1 tag-scroll-container"
              onScroll={checkArrows}
            >
              <div className="flex space-x-1.5 min-w-max">
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "px-2.5 text-xs font-medium rounded-full h-7 transition-colors",
                      selectedTag === tag 
                        ? "hover:bg-primary/90" 
                        : "hover:bg-accent"
                    )}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  >
                    {tag}
                    {selectedTag === tag && (
                      <X 
                        className="ml-1.5 h-3 w-3 opacity-70" 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTag(null)
                        }}
                      />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Right Gradient + Arrow */}
            <div 
              className={cn(
                "absolute right-0 top-0 bottom-0 flex items-center z-20 transition-opacity duration-200",
                showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 mr-2 rounded-full bg-background/95 shadow-md hover:bg-accent relative z-30"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Character Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {loading ? (
              [...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-full aspect-[3/4] bg-muted/50 rounded-lg animate-pulse"
                />
              ))
            ) : filteredCharacters.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {selectedTag ? `No characters found with tag "${selectedTag}"` : 'No characters available.'}
              </div>
            ) : (
              currentCharacters.map((character) => (
                <CharacterCard 
                  key={character.id} 
                  character={{
                    id: character.id,
                    name: character.name,
                    tagline: character.tagline ?? '',
                    system_prompt: character.system_prompt ?? '',
                    greeting: character.greeting ?? '',
                    visibility: character.visibility ?? 'Private',
                    tags: character.tags ?? [],
                    nsfw: character.nsfw ?? false,
                    max_tokens: character.max_tokens ?? null,
                    image_url: character.image_url || null,
                    avatar: null,  // Default value since it's not in DB
                    description: character.description ?? '',
                    created_by: character.created_by || null,
                    creator_name: character.creator_name ?? '',
                    created_at: character.created_at || null,
                    updated_at: character.updated_at || null,
                    owner_id: character.created_by || null,
                    owner_name: character.creator_name || null
                  }}
                  isOwner={user?.id === character.created_by}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className="w-8"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </ClientWrapper>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
