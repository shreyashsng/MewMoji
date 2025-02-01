'use client'

import { ThemeProvider } from 'next-themes'
import { CharacterProvider } from '@/contexts/CharacterContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { PersonaProvider } from '@/contexts/PersonaContext'
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AuthProvider>
        <TooltipProvider>
          <PersonaProvider>
            <CharacterProvider>
              {children}
            </CharacterProvider>
          </PersonaProvider>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  )
} 