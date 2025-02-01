'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TagListProps {
  selectedTag?: string
  onTagSelect?: (tag: string) => void
  className?: string
}

interface TagCount {
  [key: string]: number
}

export function TagList({ selectedTag, onTagSelect, className }: TagListProps) {
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Get all characters' tags
        const { data, error } = await supabase
          .from('characters')
          .select('tags, visibility')
          .eq('visibility', 'Public') // Only get tags from public characters

        if (error) throw error

        // Extract and flatten all tags
        const allTags = data
          .flatMap(char => char.tags || [])
          .map(tag => tag.toLowerCase().trim()) // Normalize tags
          .filter(Boolean) // Remove empty tags

        // Count occurrences of each tag
        const tagCounts: TagCount = {}
        allTags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })

        // Filter tags that appear more than once and sort by frequency
        const popularTags = Object.entries(tagCounts)
          .filter(([_, count]: [string, number]) => count > 1)
          .sort(([, a], [, b]) => b - a)
          .map(([tag]) => tag)
          .slice(0, 20) // Limit to top 20 tags

        setTags(popularTags)
      } catch (error) {
        console.error('Error fetching tags:', error)
      }
    }

    fetchTags()
  }, [])

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map(tag => (
        <Badge
          key={tag}
          variant={selectedTag === tag ? "default" : "secondary"}
          className={cn(
            "cursor-pointer hover:bg-primary/90 transition-colors",
            selectedTag === tag ? "bg-primary" : "bg-secondary hover:bg-secondary/80"
          )}
          onClick={() => onTagSelect?.(selectedTag === tag ? '' : tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
} 