// Base character interface with all possible properties
export interface Character {
  id: string
  name: string
  tagline: string | null
  system_prompt: string | null
  greeting: string | null
  visibility: string
  tags: string[] | null
  nsfw: boolean
  max_tokens: number | null
  avatar: string | null
  image_url: string | null
  description: string | null
  created_by: string | null
  creator_name: string | null
  created_at: string | null
  updated_at: string | null
  owner_id: string | null
  owner_name?: string | null
}

// Character card interface extends base with message stats
export interface CharacterCard extends Character {
  messageCount?: number
  messages?: { count: number }[]
}

// Context type for character management
export type CharacterContextType = {
  character: Character | null
  avatarUrl: string | null
  loadCharacter: (id: string) => Promise<void>
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>
  updateAvatar: (id: string, file: File) => Promise<void>
  setCharacter: (character: Character) => Promise<Character>
}

interface CharacterFromDB {
  id: string
  name: string
  tagline: string | null
  image_url: string | null
  tags: string[] | null
  visibility: string
  nsfw: boolean
  description?: string | null
  greeting?: string | null
  system_prompt?: string | null
  created_by: string | null
  creator_name: string | null
  created_at: string | null
  updated_at: string | null
  owner_id: string | null
  owner_name: string | null
}

// Add this interface
export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
  chat_id: string
} 