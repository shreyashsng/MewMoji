'use client'

import { motion } from 'framer-motion'
import { formatModelResponse } from '@/utils/textFormatting'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useCharacter } from '@/contexts/CharacterContext'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  avatar: string
}

export default function ChatMessage({ role, content, avatar }: ChatMessageProps) {
  const { character } = useCharacter()
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 px-4",
        isUser ? "flex-row-reverse" : "flex-row",
        isUser ? "ml-12" : "mr-12"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 pt-1">
        <Avatar className="w-8 h-8">
          <AvatarImage 
            src={isUser ? '' : avatar} 
            className="object-cover"
          />
          <AvatarFallback className={cn(
            "text-sm font-medium",
            isUser ? "bg-primary/10 text-primary" : "bg-muted"
          )}>
            {isUser ? 'U' : character?.name?.[0]}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex flex-col gap-1.5 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Sender Name */}
        <div className="text-xs font-medium text-muted-foreground px-1">
          {isUser ? 'You' : character?.name}
        </div>

        {/* Message Bubble */}
        <div className={cn(
          "relative px-4 py-2.5 rounded-2xl",
          isUser ? 
            "bg-white text-black rounded-tr-none" : 
            "bg-muted rounded-tl-none"
        )}>
          {/* Message Text */}
          <div 
            className="prose prose-sm max-w-none text-current"
            dangerouslySetInnerHTML={{ 
              __html: formatModelResponse(content) 
            }}
          />

          {/* Bubble Tail */}
          <div className={cn(
            "absolute top-0 w-2 h-2",
            isUser ? 
              "-right-1.5 border-8 border-transparent border-l-white" : 
              "-left-1.5 border-8 border-transparent border-r-muted"
          )} />
        </div>
      </div>
    </motion.div>
  )
} 