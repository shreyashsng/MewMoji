'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { SendHorizontal, Cpu } from "lucide-react"
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  onModelChange?: (model: string) => void
  currentModel?: string
}

const AVAILABLE_MODELS = [
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B',
  },
  {
    id: 'huggingfaceh4/zephyr-7b-beta:free',
    name: 'Zephyr 7B beta',
  },
  {
    id: 'undi95/toppy-m-7b:free',
    name: 'Toppy M 7B',
  },
  {
    id: 'gryphe/mythomax-l2-13b:free',
    name: 'MythoMax 13B',
  }
]

export default function MessageInput({ 
  onSendMessage, 
  disabled, 
  className,
  placeholder = "Type a message...",
  onModelChange,
  currentModel = 'mistralai/mistral-7b-instruct:free'
}: MessageInputProps) {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setShowAuthModal(true)
      return
    }
    if (!message.trim() || disabled) return

    onSendMessage(message.trim())
    setMessage('')
  }

  const handleInteraction = (e: React.MouseEvent | React.FocusEvent) => {
    if (!user) {
      e.preventDefault()
      setShowAuthModal(true)
    }
  }

  return (
    <>
      <motion.form 
        onSubmit={handleSubmit}
        animate={{
          width: isFocused ? '100%' : ['90%', '85%'],
          scale: [1, isFocused ? 1 : 0.98]
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        className={cn(
          "relative flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl mx-auto",
          "bg-background/60 backdrop-blur-lg border border-border/50",
          "shadow-lg shadow-black/5",
          "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none",
          className
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted/50 shrink-0"
            >
              <Cpu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start"
            className="w-[180px] sm:w-[200px]"
          >
            {AVAILABLE_MODELS.map(model => (
              <DropdownMenuItem
                key={model.id}
                className="flex items-center gap-2 py-2 sm:py-3"
                onSelect={() => onModelChange?.(model.id)}
              >
                <div className={cn(
                  "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                  currentModel === model.id ? "bg-primary" : "bg-muted"
                )} />
                <span className="text-xs sm:text-sm font-medium">{model.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1 relative min-w-0">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onClick={handleInteraction}
            onFocus={(e) => {
              handleInteraction(e)
              setIsFocused(true)
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
            placeholder={user ? placeholder : "Sign in to start chatting..."}
            className={cn(
              "w-full bg-transparent border-none outline-none resize-none",
              "max-h-32 py-1.5 px-2 sm:p-2",
              "text-sm sm:text-base",
              "placeholder:text-muted-foreground/50",
              "placeholder:text-xs sm:placeholder:text-sm",
              "transition-all duration-200",
              isFocused && "pl-3"
            )}
            rows={1}
          />
        </div>

        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim() || disabled}
          className={cn(
            "rounded-full shrink-0",
            "h-8 w-8 sm:h-9 sm:w-9",
            "bg-primary hover:bg-primary/90 transition-colors"
          )}
          onClick={handleInteraction}
        >
          <SendHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </motion.form>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </>
  )
} 