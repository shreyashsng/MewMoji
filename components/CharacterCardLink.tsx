'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from "@/components/ui/card"
import type { CharacterCard } from '@/types/character'
import { useState } from 'react'
import { AtSign, MessageCircle } from 'lucide-react'

interface CharacterCardLinkProps {
  character: CharacterCard
  messageCount: number
}

export function CharacterCardLink({ character, messageCount }: CharacterCardLinkProps) {
  const handleClick = () => {
    const savedCharacters = JSON.parse(localStorage.getItem('characters') || '{}')
    savedCharacters[character.id] = character
    localStorage.setItem('characters', JSON.stringify(savedCharacters))
  }

  return (
    <Link href={`/chat/${character.id}`} className="block" onClick={handleClick}>
      <CharacterCard character={character} messageCount={messageCount} />
    </Link>
  )
}

function CharacterCard({ character, messageCount }: CharacterCardLinkProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden w-full">
      <div className="aspect-square relative overflow-hidden bg-muted">
        {character.avatar && !imageError && (
          <Image
            src={character.avatar}
            alt={character.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            priority
          />
        )}
        {(!character.avatar || imageError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <span className="text-2xl font-bold">{character.name[0]}</span>
          </div>
        )}
        {character.nsfw && (
          <span className="absolute top-2 right-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded-full z-10">
            NSFW
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-base mb-1">{character.name}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{character.tagline}</p>
        {character.tags && character.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {character.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
            {character.tags.length > 3 && (
              <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full">
                +{character.tags.length - 3}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <AtSign className="h-3 w-3 mr-0.5" />
            <span>mewmoji</span>
          </div>
          <div className="flex items-center">
            <MessageCircle className="h-3 w-3 mr-0.5" />
            <span>{messageCount}</span>
          </div>
        </div>
      </div>
    </Card>
  )
} 