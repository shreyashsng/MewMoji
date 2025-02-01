'use client'

import Link from 'next/link'
import { Home, Plus, Sun, Moon, Search, X, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'
import { Input } from './ui/input'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Dialog, DialogContent } from './ui/dialog'
import { CreateDropdown } from './CreateDropdown'
import { springTransition, slideInVariants } from '@/lib/animations'

interface SearchResult {
  id: string
  name: string
  tagline: string
  image_url: string | null
  tags: string[]
}

export function MobileNav() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  
  // Motion values for smooth animations
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 200], [1, 0])
  const scale = useTransform(y, [0, 200], [1, 0.95])
  const borderRadius = useTransform(y, [0, 200], [12, 24])
  const dragConstraintsRef = useRef(null)

  useEffect(() => {
    // Reset motion values when modal opens
    if (showSearch) {
      y.set(0)
    }
  }, [showSearch])

  // Search logic
  useEffect(() => {
    const searchCharacters = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const { data, error } = await supabase
          .from('characters')
          .select('id, name, tagline, image_url, tags')
          .ilike('name', `%${searchQuery}%`)
          .limit(10)

        if (error) throw error
        setSearchResults(data || [])
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimeout = setTimeout(searchCharacters, 300)
    return () => clearTimeout(debounceTimeout)
  }, [searchQuery])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const yOffset = info.offset.y
    const yVelocity = info.velocity.y

    if (yOffset > 100 || yVelocity > 500) {
      setShowSearch(false)
    } else {
      y.set(0)
    }
  }

  if (pathname.startsWith('/chat')) {
    return null
  }

  return (
    <>
      <div className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-full",
        "bg-background/80 backdrop-blur-lg border shadow-lg",
        "sm:hidden"
      )}>
        <Link href="/">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-10 w-10 rounded-full bg-background/50 hover:bg-background/80 transition-colors",
              pathname === "/" && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
          onClick={() => setShowSearch(true)}
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>

        <CreateDropdown />

        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <AnimatePresence>
        {showSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setShowSearch(false)}
            />
            <motion.div 
              className="fixed left-0 right-0 mx-auto top-[20%] z-50 w-full sm:max-w-[400px] p-4"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300
              }}
            >
              <motion.div
                style={{ y, scale, borderRadius }}
                drag="y"
                dragDirectionLock
                dragElastic={0.8}
                dragConstraints={{ top: 0, bottom: 600 }}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={springTransition}
                className="bg-card border shadow-lg overflow-hidden"
              >
                <div className="flex justify-center pt-4 touch-none">
                  <div className="w-12 h-1 rounded-full bg-muted-foreground/20" />
                </div>

                <div className="p-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search characters..."
                      className="w-full pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <motion.div 
                    className="space-y-2 max-h-[400px] overflow-auto"
                    layout
                  >
                    {isSearching ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-sm text-muted-foreground py-4"
                      >
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                      </motion.div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <motion.div
                          key={result.id}
                          layout
                          variants={slideInVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Link 
                            href={`/chat/${result.id}`}
                            onClick={() => setShowSearch(false)}
                          >
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted">
                              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                {result.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm">{result.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">
                                  {result.tagline}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))
                    ) : searchQuery ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-sm text-muted-foreground py-4"
                      >
                        No characters found
                      </motion.div>
                    ) : null}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </>
  )
} 