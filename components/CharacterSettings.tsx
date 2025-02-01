'use client'

import { useState, useRef, useEffect } from 'react'
import { Settings, Upload, X, Globe2, Lock, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCharacter } from '@/contexts/CharacterContext'
import type { CharacterCard } from '@/types/character'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ImageCropper } from "@/components/ui/image-cropper"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/AuthModal'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from '@/lib/utils'

interface EditableCharacter {
  id: string
  name: string
  tagline: string | null
  system_prompt: string | null
  greeting: string | null
  visibility: 'Public' | 'Private'
  image_url: string | null
}

interface CharacterSettingsProps {
  variant?: 'default' | 'ghost'
}

export default function CharacterSettings({ variant = 'default' }: CharacterSettingsProps) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { character, avatarUrl, updateCharacter, updateAvatar } = useCharacter()
  const [editedCharacter, setEditedCharacter] = useState<EditableCharacter | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [showCropper, setShowCropper] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && character) {
      setEditedCharacter({
        id: character.id,
        name: character.name,
        tagline: character.tagline,
        system_prompt: character.system_prompt,
        greeting: character.greeting,
        visibility: character.visibility as 'Public' | 'Private',
        image_url: character.image_url
      })
    }
  }, [open, character])

  const handleTriggerClick = () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
  }

  const handleVisibilityChange = (newVisibility: 'Public' | 'Private') => {
    setEditedCharacter(prev => 
      prev ? { ...prev, visibility: newVisibility } : null
    )
  }

  const handleSave = async () => {
    if (!editedCharacter || !character) {
      return
    }

    setIsSaving(true)
    setError(null)
    
    try {
      // Update character data including visibility
      await updateCharacter(character.id, {
        name: editedCharacter.name,
        tagline: editedCharacter.tagline,
        system_prompt: editedCharacter.system_prompt,
        greeting: editedCharacter.greeting,
        visibility: editedCharacter.visibility,
        updated_at: new Date().toISOString()
      })

      // Handle avatar update if needed
      if (avatarFile) {
        await updateAvatar(character.id, avatarFile)
      }

      setOpen(false)
    } catch (err) {
      setError('Failed to save changes. Please try again.')
      console.error('Error saving character:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setError(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result) {
          setCropImageSrc(reader.result.toString())
          setShowCropper(true)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = async (croppedImage: string) => {
    try {
      // Convert base64 to blob
      const base64Response = await fetch(croppedImage)
      const blob = await base64Response.blob()
      
      // Create file from blob
      const file = new File([blob], 'avatar.png', { 
        type: 'image/png'
      })
      
      if (character?.id && file) {
        setError(null)
        await handleAvatarUpload(file)
      }
    } catch (error) {
      console.error('Error handling crop:', error)
      setError('Failed to update avatar. Please try again.')
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      if (!character?.id) return
      
      await updateAvatar(character.id, file)
      setShowCropper(false)
      setOpen(false) // Close the dialog after successful upload
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setError('Failed to upload avatar. Please try again.')
    }
  }

  const removeAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (character?.image_url) {
        // Delete the old avatar from storage
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([character.image_url])
        
        if (deleteError) throw deleteError

        // Update character to remove image_url
        await updateCharacter(character.id, {
          image_url: null
        })
      }

      setAvatarPreview('')
      setAvatarFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error removing avatar:', error)
      setError('Failed to remove avatar. Please try again.')
    }
  }

  if (!character) return null

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
        <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto p-0">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleAvatarChange}
          />
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/40">
            <DialogTitle className="text-xl">Character Settings</DialogTitle>
            <DialogDescription>
              Customize your character's profile and behavior
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable content area */}
          <div className="px-6 py-6 space-y-8">
            {/* Avatar Section */}
            <div className="flex gap-6 items-start">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="w-24 h-24 ring-2 ring-primary/10 transition-all group-hover:ring-primary/30">
                  <AvatarImage 
                    src={avatarUrl || `/avatars/default.png`} 
                    alt={character?.name || 'Character'} 
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <AvatarFallback className="text-lg font-medium">
                    {character?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-medium text-base">Character Avatar</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upload a square image for best results. Recommended size: 512x512px.
                </p>
              </div>
            </div>

            {/* Main Settings */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editedCharacter?.name || ''}
                  onChange={(e) => setEditedCharacter(prev => 
                    prev ? { ...prev, name: e.target.value } : null
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={editedCharacter?.tagline || ''}
                  onChange={(e) => setEditedCharacter(prev => 
                    prev ? { ...prev, tagline: e.target.value } : null
                  )}
                />
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="system_prompt">System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  value={editedCharacter?.system_prompt || ''}
                  onChange={(e) => setEditedCharacter(prev => 
                    prev ? { ...prev, system_prompt: e.target.value } : null
                  )}
                  className="min-h-[100px]"
                />
              </div>

              {/* Greeting */}
              <div className="space-y-2">
                <Label htmlFor="greeting">Greeting Message</Label>
                <Textarea
                  id="greeting"
                  value={editedCharacter?.greeting || ''}
                  onChange={(e) => setEditedCharacter(prev => 
                    prev ? { ...prev, greeting: e.target.value } : null
                  )}
                  className="min-h-[100px]"
                />
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label>Visibility</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={editedCharacter?.visibility === 'Public' ? 'default' : 'outline'}
                    onClick={() => handleVisibilityChange('Public')}
                    className="flex-1"
                  >
                    <Globe2 className="mr-2 h-4 w-4" />
                    Public
                  </Button>
                  <Button
                    type="button"
                    variant={editedCharacter?.visibility === 'Private' ? 'default' : 'outline'}
                    onClick={() => handleVisibilityChange('Private')}
                    className="flex-1"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Private
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 mt-8 border-t bg-muted/40 -mx-6 -mb-6 px-6 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />

      <ImageCropper
        open={showCropper}
        onClose={() => setShowCropper(false)}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
      />
    </>
  )
} 