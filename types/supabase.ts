export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      characters: {
        Row: {
          id: string
          name: string
          tagline: string
          system_prompt: string
          greeting: string
          visibility: string
          tags: string[]
          nsfw: boolean
          max_tokens: number
          avatar: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          tagline: string
          system_prompt: string
          greeting: string
          visibility?: string
          tags?: string[]
          nsfw?: boolean
          max_tokens?: number
          avatar?: string | null
          created_by: string
        }
        Update: {
          name?: string
          tagline?: string
          system_prompt?: string
          greeting?: string
          visibility?: string
          tags?: string[]
          nsfw?: boolean
          max_tokens?: number
          avatar?: string | null
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          character_id: string
          content: string
          role: 'user' | 'assistant'
          created_at: string
        }
        Insert: {
          character_id: string
          content: string
          role: 'user' | 'assistant'
        }
        Update: {
          content?: string
          role?: 'user' | 'assistant'
        }
      }
    }
    Functions: {
      get_character_stats: {
        Args: { char_id: string }
        Returns: { message_count: number }[]
      }
    }
  }
} 