'use client'

import { useState } from 'react'
import { Sliders, Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { AISettings } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/AuthModal'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ModelSettingsPanelProps {
  settings: AISettings
  onSettingsChange: (settings: AISettings) => void
  variant?: 'default' | 'ghost'
}

export function ModelSettingsPanel({ settings, onSettingsChange, variant = 'default' }: ModelSettingsPanelProps) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleChange = (key: keyof AISettings, value: number[]) => {
    onSettingsChange({
      ...settings,
      [key]: value[0]
    })
  }

  const handleReset = () => {
    onSettingsChange(DEFAULT_SETTINGS)
  }

  const handleTriggerClick = () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={variant}
            size="icon"
            className="h-9 w-9"
            onClick={handleTriggerClick}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px] max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/40">
            <DialogTitle className="text-xl">Model Settings</DialogTitle>
            <DialogDescription>
              Adjust the AI model's behavior and response style
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable content area */}
          <div className="px-6 py-6 space-y-8">
            {/* Temperature */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature">Temperature</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.temperature.toFixed(1)}
                </span>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[settings.temperature]}
                onValueChange={(value) => handleChange('temperature', value)}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              />
              <span className="text-xs text-muted-foreground">
                Controls randomness: Lower = more focused, Higher = more creative
              </span>
            </div>

            {/* Top P */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="top_p">Top P</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.top_p.toFixed(2)}
                </span>
              </div>
              <Slider
                id="top_p"
                min={0}
                max={1}
                step={0.05}
                value={[settings.top_p]}
                onValueChange={(value) => handleChange('top_p', value)}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              />
              <span className="text-xs text-muted-foreground">
                Controls diversity of word choices
              </span>
            </div>

            {/* Frequency Penalty */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="frequency_penalty">Frequency Penalty</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.frequency_penalty.toFixed(1)}
                </span>
              </div>
              <Slider
                id="frequency_penalty"
                min={-2}
                max={2}
                step={0.1}
                value={[settings.frequency_penalty]}
                onValueChange={(value) => handleChange('frequency_penalty', value)}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              />
              <span className="text-xs text-muted-foreground">
                Reduces repetition of similar words
              </span>
            </div>

            {/* Presence Penalty */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="presence_penalty">Presence Penalty</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.presence_penalty.toFixed(1)}
                </span>
              </div>
              <Slider
                id="presence_penalty"
                min={-2}
                max={2}
                step={0.1}
                value={[settings.presence_penalty]}
                onValueChange={(value) => handleChange('presence_penalty', value)}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              />
              <span className="text-xs text-muted-foreground">
                Encourages discussing new topics
              </span>
            </div>

            {/* Typing Speed */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="typing_speed">Typing Speed</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.typing_speed}ms
                </span>
              </div>
              <Slider
                id="typing_speed"
                min={10}
                max={200}
                step={10}
                value={[settings.typing_speed]}
                onValueChange={(value) => handleChange('typing_speed', value)}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              />
              <span className="text-xs text-muted-foreground">
                Faster ← → Slower typing animation
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-6 mt-8 border-t bg-muted/40 -mx-6 -mb-6 px-6 pb-6">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReset}>Reset to Default</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </>
  )
} 