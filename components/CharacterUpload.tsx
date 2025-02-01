'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useCharacter } from '@/contexts/CharacterContext'
import { useRouter } from 'next/navigation'
import { CharacterCard } from '@/types/character'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileJson, AlertCircle } from "lucide-react"
import { v4 as uuidv4 } from 'uuid'
import { cn } from "@/lib/utils"
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface CharacterFile {
  name: string
  tagline: string
  system_prompt: string
  greeting: string
  visibility: string
  tags: string[]
  nsfw: boolean
  max_tokens: number
  image?: string
  description?: string
}

// Add type for form data
interface CharacterFormData extends FormData {
  visibility: string;
}

export default function CharacterUpload() {
  const router = useRouter()
  const { setCharacter } = useCharacter()
  const { user } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    if (!user) {
      toast.error('Please sign in to upload characters')
      router.push('/login')
      return
    }

    setIsLoading(true)
    try {
      const text = await file.text()
      const characterData: CharacterFile = JSON.parse(text)
      
      const character = {
        id: uuidv4(),
        name: characterData.name,
        tagline: characterData.tagline || 'A mysterious character',
        description: characterData.description || '',
        system_prompt: characterData.system_prompt,
        greeting: characterData.greeting,
        visibility: characterData.visibility?.toLowerCase() === 'public' ? 'Public' : 'Private',
        tags: characterData.tags || [],
        nsfw: characterData.nsfw || false,
        max_tokens: characterData.max_tokens || 150,
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner_id: user.id,
        owner_name: `@${user.user_metadata.full_name?.replace(/\s+/g, '')}`
      }
      
      if (!character.name || !character.system_prompt || !character.greeting) {
        throw new Error('Missing required fields')
      }

      const { data: savedCharacter, error } = await supabase
        .from('characters')
        .insert([character])
        .select()
        .single()

      if (error) throw error

      toast.success('Character uploaded successfully!')
      router.push(`/chat/${savedCharacter.id}`)
    } catch (err) {
      console.error('Upload error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to load character')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleSubmit = async (data: CharacterFormData) => {
    if (!user) return;

    try {
      const characterData = {
        ...data,
        created_by: user.id,
        creator_name: `@${user.user_metadata.full_name?.replace(/\s+/g, '')}`,
        visibility: (data.visibility || 'private').toLowerCase() === 'public' ? 'Public' : 'Private',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: savedCharacter, error } = await supabase
        .from('characters')
        .insert([characterData])
        .select()
        .single()

      if (error) throw error

      toast.success('Character created successfully!')
      router.push(`/chat/${savedCharacter.id}`)
    } catch (error) {
      console.error('Error creating character:', error)
      toast.error('Failed to create character')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background/95">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          className={cn(
            "group relative overflow-hidden w-[280px] transition-all duration-300",
            "bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            "hover:shadow-lg hover:bg-card border-dashed",
            isDragging && "ring-2 ring-primary border-primary",
            isLoading && "opacity-70 pointer-events-none"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Upload Section */}
          <div className="relative w-full pt-[100%] overflow-hidden bg-muted/30">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="relative mx-auto mb-4 w-16 h-16">
                  <div className="absolute inset-0 bg-primary/10 rounded-xl rotate-6 transition-transform group-hover:rotate-12" />
                  <div className="absolute inset-0 bg-primary/20 rounded-xl -rotate-6 transition-transform group-hover:-rotate-12" />
                  <div className="relative bg-background rounded-xl p-3">
                    <FileJson className="w-10 h-10 text-primary/80" />
                  </div>
                </div>
                <p className="font-medium text-base">
                  Drop JSON here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="relative p-4 space-y-4">
            {/* Header */}
            <div>
              <h3 className="font-semibold text-lg">
                Upload Character
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Import your character from a JSON file
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-2 text-xs text-muted-foreground/80">
              <p className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Character card must include name, system prompt, and greeting
              </p>
              <p className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Images can be added after upload
              </p>
            </div>

            {/* Upload Button */}
            <Button 
              variant="outline" 
              className="w-full h-9 mt-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4 animate-bounce" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Choose File
                </span>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <span className="text-xs font-semibold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                MewMoji
              </span>
              <span className="text-xs text-muted-foreground/60">
                JSON files only
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
} 