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
          tagline: string | null
          description: string | null
          system_prompt: string | null
          greeting: string | null
          visibility: string
          tags: string[] | null
          nsfw: boolean
          max_tokens: number | null
          image_url: string | null
          created_by: string | null
          creator_name: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          tagline?: string | null
          system_prompt?: string | null
          greeting?: string | null
          visibility?: string | null
          tags?: string[] | null
          nsfw?: boolean | null
          max_tokens?: number | null
          image_url?: string | null
          created_by?: string | null
          creator_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          tagline?: string | null
          system_prompt?: string | null
          greeting?: string | null
          visibility?: string | null
          tags?: string[] | null
          nsfw?: boolean | null
          max_tokens?: number | null
          image_url?: string | null
          created_by?: string | null
          creator_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          character_id: string
          content: string
          role: string
          created_at: string | null
        }
        Insert: {
          id?: string
          character_id: string
          content: string
          role: string
          created_at?: string | null
        }
        Update: {
          id?: string
          character_id?: string
          content?: string
          role?: string
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface Character {
  id: string
  name: string
  tagline: string | null
  system_prompt: string | null
  greeting: string | null
  visibility: string | null
  tags: string[] | null
  nsfw: boolean | null
  max_tokens: number | null
  image_url: string | null
  created_by: string | null
  creator_name: string | null
  created_at: string | null
  updated_at: string | null
  description?: string | null
  owner_id?: string | null
  owner_name?: string | null
  avatar?: string | null
} 