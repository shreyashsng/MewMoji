'use client'

import { useState, useRef, useEffect, useCallback, useTransition, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import MessageInput from './MessageInput'
import { useCharacter } from '@/contexts/CharacterContext'
import CharacterUpload from './CharacterUpload'
import { OPENROUTER_API_KEY, SITE_NAME, SITE_URL } from '@/config/api'
import type { AISettings } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'
import { useRouter } from 'next/navigation'
import { ModelSettingsPanel } from './ModelSettingsPanel'
import CharacterSettings from './CharacterSettings'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, Settings, Sliders, Share2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import ChatBubble from './ChatBubble'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { Navbar } from './Navbar'
import { usePersona } from '@/contexts/PersonaContext'
import ChatMessage from './ChatMessage'
import { PersonaSelector } from './PersonaSelector'
import { ChatSettings } from './ChatSettings'
import { SITE_URL as SiteURL } from '@/lib/constants'
import { Message } from '@/types/character'

interface ChatInterfaceProps {
  characterId?: string
}

const TypingIndicator = memo(function TypingIndicator({ sender, avatar }: { sender: string; avatar: string }) {
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <img
        src={avatar}
        alt={sender}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0 object-cover"
      />
      <div className="flex items-center gap-1 px-3 py-2 bg-muted/50 rounded-xl">
        <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
})

export default function ChatInterface({ characterId }: ChatInterfaceProps) {
  const { character, avatarUrl, loadCharacter } = useCharacter()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [aiSettings, setAISettings] = useState<AISettings>(DEFAULT_SETTINGS)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [currentModel, setCurrentModel] = useState('mistralai/mistral-7b-instruct:free')
  const { user } = useAuth()
  const { currentPersona, personas } = usePersona()
  const [isTyping, setIsTyping] = useState(false)

  // Load character and initialize chat
  useEffect(() => {
    if (!characterId) return
    if (!user) {
      router.push('/')
      return
    }

    const loadData = async () => {
      try {
        await loadCharacter(characterId)
        const chatData = await fetchChat()

        if (!chatData) {
          const { data: newChat, error: createError } = await supabase
            .from('chats')
            .insert({ 
              character_id: characterId,
              user_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (createError) {
            if (createError.code === '42501') {
              toast.error('Permission denied. Please try logging in again.')
              router.push('/')
              return
            }
            toast.error('Failed to start chat. Please try again.')
            console.error('Error creating chat:', createError)
            return
          }

          return newChat
        }

        return chatData
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load chat data. Please try again.')
        return null
      }
    }

    loadData()
  }, [characterId, loadCharacter, user, router])

  // Scroll to bottom helper function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // Auto scroll when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const saveMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!characterId || !user) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: characterId,
          user_id: user.id,
          content,
          role
        })

      if (error) {
        console.error('Error saving message:', error)
      }
    } catch (err) {
      console.error('Error in saveMessage:', err)
    }
  }

  const sendMessage = useCallback(async (content: string) => {
    if (isLoading || !character || !user || !content.trim()) return

    // When adding a new message, include all required fields
    const newMessage: Message = {
      id: crypto.randomUUID(), // Generate unique ID
      content: content.trim(),
      role: 'user',
      created_at: new Date().toISOString(),
      chat_id: characterId || ''
    }

    setMessages(prev => [...prev, newMessage])

    setIsLoading(true)
    setIsTyping(true)

    try {
      // Save user message to database
      await saveMessage(content.trim(), 'user')

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': SITE_URL,
          'X-Title': SITE_NAME,
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            {
              role: 'system',
              content: constructSystemPrompt() + '\nIMPORTANT: Do not use quotes around your responses.'
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: content.trim()
            }
          ]
        })
      })

      const data = await response.json()
      const aiResponse = data.choices[0].message.content.replace(/^"|"$/g, '')
      
      // Add AI response to UI
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: aiResponse,
        role: 'assistant',
        created_at: new Date().toISOString(),
        chat_id: characterId || ''
      }

      setMessages(prev => [...prev, aiMessage])

      // Save AI response to database
      await saveMessage(aiResponse, 'assistant')

    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }, [character, isLoading, messages, currentModel, user, saveMessage])

  const handleBack = () => {
    router.push('/')
  }

  // Add debug check
  useEffect(() => {
    console.log('Current character:', character?.id, 'Expected:', characterId)
  }, [character, characterId])

  const handleModelChange = (model: string) => {
    setCurrentModel(model)
    // Save the selected model to localStorage for this character
    if (character?.id) {
      const savedModels = JSON.parse(localStorage.getItem('characterModels') || '{}')
      savedModels[character.id] = model
      localStorage.setItem('characterModels', JSON.stringify(savedModels))
    }
  }

  // Load saved model preference when character loads
  useEffect(() => {
    if (character?.id) {
      const savedModels = JSON.parse(localStorage.getItem('characterModels') || '{}')
      const savedModel = savedModels[character.id]
      if (savedModel) {
        setCurrentModel(savedModel)
      }
    }
  }, [character?.id])

  const fetchChat = async () => {
    if (!user || !characterId) return null;
    
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')  // Changed from just 'id' to '*'
        .eq('character_id', characterId)
        .eq('user_id', user.id)
        .maybeSingle() // Using maybeSingle() instead of single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching chat:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching chat:', error)
      return null
    }
  }

  const constructSystemPrompt = useCallback(() => {
    if (!character) return ''

    let prompt = `You are ${character.name}. ${character.tagline || ''}

${character.system_prompt}

IMPORTANT GUIDELINES:
- Keep initial responses very short (1-2 lines) unless specifically asked for more
- Use expressions like *smiles*, *tilts head*, (waves shyly) to show emotions
- Match the length and tone of user's messages
- Be natural and casual in conversation
- No lengthy introductions or explanations unless asked
- If user says "hey" or "hi", respond briefly with a greeting and maybe one short question

Example responses:
User: "hey"
You: "*looks up curiously* Oh, hello there! Have you traveled far?"

User: "how are you"
You: "*stretches thoughtfully* Just contemplating the mysteries of life. How's your day going?"

Remember to stay in character while being concise and expressive.`

    if (currentPersona) {
      prompt += `\n\nYou're talking to ${currentPersona.name}, who is ${currentPersona.personality}. They're interested in: ${currentPersona.interests.join(', ')}`
    }

    return prompt
  }, [character, currentPersona])

  const handleShare = async () => {
    // Get the current URL if in browser
    const currentUrl = typeof window !== 'undefined' 
      ? window.location.href 
      : `${SITE_URL}/chat/${characterId}`

    if (navigator.share) {
      // Use native share if available
      try {
        await navigator.share({
          title: `Chat with ${character?.name}`,
          text: `Chat with ${character?.name} - ${character?.tagline}`,
          url: currentUrl
        })
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          copyToClipboard(currentUrl)
        }
      }
    } else {
      copyToClipboard(currentUrl)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  // Add null checks where needed
  const characterName = character?.name || 'AI'
  const characterAvatar = character?.image_url || null
  
  if (!character && !characterId) return <CharacterUpload />
  if (!character || character.id !== characterId) return null // Add this check

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-5xl mx-auto flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b">
            <Link href="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                {characterAvatar ? (
                  <Image
                    src={characterAvatar}
                    alt={characterName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {characterName[0]}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold truncate">
                  {characterName}
                </h1>
                {character?.tagline && (
                  <p className="text-sm text-muted-foreground truncate">
                    {character.tagline}
                  </p>
                )}
              </div>
            </div>

            {/* Add Share Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 mr-2"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Share character</span>
            </Button>

            <ChatSettings 
              aiSettings={aiSettings}
              onAISettingsChange={setAISettings}
            />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  avatar={message.role === 'user' ? '' : character?.image_url || ''}
                />
              ))}
              {/* Invisible div for scrolling */}
              <div ref={messagesEndRef} />
            </div>

            {/* Move typing indicator here and fix condition */}
            {isTyping && (
              <div className="flex gap-2 text-muted-foreground items-center p-4">
                <div className="w-8 h-8 rounded-full bg-muted/30 animate-pulse" />
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="sticky bottom-0 p-2 sm:p-4 bg-gradient-to-t from-background to-transparent">
            <div className="max-w-3xl mx-auto">
              <MessageInput
                onSendMessage={sendMessage}
                disabled={isTyping}
                placeholder={`Chat with ${characterName}...`}
                onModelChange={handleModelChange}
                currentModel={currentModel}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 