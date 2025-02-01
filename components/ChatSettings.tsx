'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { PersonaSelector } from './PersonaSelector'
import { ModelSettingsPanel } from './ModelSettingsPanel'
import CharacterSettings from './CharacterSettings'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCharacter } from '@/contexts/CharacterContext'
import type { AISettings } from '@/types/settings'

interface ChatSettingsProps {
  aiSettings: AISettings
  onAISettingsChange: (settings: AISettings) => void
}

export function ChatSettings({ aiSettings, onAISettingsChange }: ChatSettingsProps) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { character } = useCharacter()

  // Check if current user is the character owner using owner_id
  const isOwner = user?.id === character?.owner_id

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 hover:bg-muted/50 transition-colors"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[400px] p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-semibold">Chat Settings</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Your Persona</h3>
              <div className="h-4 w-4 rounded-full bg-primary/10" />
            </div>
            <PersonaSelector />
          </section>

          <Separator className="bg-border/40" />

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">AI Model Settings</h3>
              <div className="h-4 w-4 rounded-full bg-primary/10" />
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <ModelSettingsPanel
                settings={aiSettings}
                onSettingsChange={onAISettingsChange}
                variant="ghost"
              />
            </div>
          </section>

          {/* Only show character settings to owner */}
          {isOwner && (
            <>
              <Separator className="bg-border/40" />

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Character Settings</h3>
                  <div className="h-4 w-4 rounded-full bg-primary/10" />
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <CharacterSettings variant="ghost" />
                </div>
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
} 