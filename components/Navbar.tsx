'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import { User, LogOut, Sun, Moon, Search, Command, X, ChevronLeft } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/AuthModal'
import { useState, useEffect, useMemo } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { supabase } from '@/lib/supabase'
import { CreateDropdown } from './CreateDropdown'

interface SearchResult {
  id: string
  name: string
  tagline: string
  image_url: string | null
  tags: string[]
}

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const pathname = usePathname()
  const isChat = pathname.startsWith('/chat')
  const router = useRouter()

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      // Hide on mobile in chat view
      isChat && "hidden sm:block"
    )}>
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          {/* Back Button - Only show on personas page */}
          {pathname === '/personas' && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-9 w-9"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>
          )}

          {/* Logo/Brand */}
          <Link 
            href="/" 
            className={cn(
              "flex items-center space-x-2",
              pathname === '/personas' && "ml-0"
            )}
          >
            <img src="/logo-dark.svg" alt="MewMoji" className="dark:invert h-6 w-auto" />
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden sm:flex flex-1 justify-center px-4">
            <Button
              variant="outline"
              className="relative h-9 w-full max-w-[500px] justify-start text-sm text-muted-foreground"
              onClick={() => setShowSearch(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              Search characters...
              <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Create Dropdown - Hidden on Mobile */}
            <div className="hidden sm:block">
              <CreateDropdown />
            </div>

            {/* Theme Switcher - Desktop Only */}
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata.avatar_url} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata.full_name || user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/user/${user.id}`}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9"
                onClick={() => setShowAuthModal(true)}
              >
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent 
          className="sm:max-w-[500px] p-0 gap-0 overflow-hidden"
          onInteractOutside={(e) => {
            // Prevent closing when interacting with search results
            if (searchResults.length > 0) {
              e.preventDefault()
            }
          }}
        >
          <div className="flex justify-between items-center px-6 pt-6 pb-2 border-b">
            <DialogTitle className="text-xl">Search Characters</DialogTitle>
          </div>
          
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-muted/50 p-2 mx-6 mt-4 mb-4 rounded-lg">
            <Search className="h-5 w-5 text-muted-foreground flex-none" />
            <Input
              type="search"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 px-0 h-9"
              autoFocus
            />
            <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-all hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
              <kbd className="pointer-events-none select-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                ESC
              </kbd>
            </DialogPrimitive.Close>
          </div>

          {/* Search Results */}
          <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
            <motion.div 
              className="space-y-1"
              layout
            >
              {isSearching ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-muted-foreground py-8"
                >
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                </motion.div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <motion.div
                    key={result.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Link 
                      href={`/chat/${result.id}`}
                      onClick={() => setShowSearch(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={result.image_url || undefined} />
                        <AvatarFallback className="bg-secondary">
                          {result.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{result.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {result.tagline}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {result.tags?.slice(0, 2).map(tag => (
                          <span 
                            key={tag} 
                            className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full whitespace-nowrap"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : searchQuery ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Command className="h-8 w-8 mb-2 mx-auto text-muted-foreground/50" />
                  <p>No characters found</p>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Command className="h-8 w-8 mb-2 mx-auto text-muted-foreground/50" />
                  <p>Type to search characters</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">ESC</kbd> to close
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </header>
  )
} 