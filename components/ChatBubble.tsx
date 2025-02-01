 'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

interface ChatBubbleProps {
  sender: string
  content: string
  avatar: string
  isUser?: boolean
}

function formatMessage(content: string) {
  // Replace *text* with italicized text
  return content.split(/(\*[^*]+\*)/).map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="text-muted-foreground">{part.slice(1, -1)}</em>
    }
    return part
  })
}

const UserAvatar = memo(function UserAvatar({ name }: { name: string }) {
  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs sm:text-sm">
      {name[0].toUpperCase()}
    </div>
  )
})

const ChatBubble = memo(function ChatBubble({ sender, content, avatar, isUser }: ChatBubbleProps) {
  return (
    <div className={cn(
      "flex items-start gap-2 sm:gap-3",
      isUser ? "flex-row-reverse" : "",
      isUser ? "ml-4 sm:ml-12" : "mr-4 sm:mr-12"
    )}>
      {isUser ? (
        <UserAvatar name={sender} />
      ) : (
        <img
          src={avatar}
          alt={sender}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-primary/20"
        />
      )}
      <div className={cn(
        "flex flex-col",
        isUser ? "items-end" : "items-start"
      )}>
        <span className="text-[10px] sm:text-xs text-muted-foreground mb-1">{sender}</span>
        <div
          className={cn(
            "max-w-full rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 whitespace-pre-wrap break-words",
            isUser ? 
              "bg-primary text-primary-foreground rounded-tr-none" : 
              "bg-muted rounded-tl-none"
          )}
        >
          {formatMessage(content)}
        </div>
      </div>
    </div>
  )
})

export default ChatBubble 