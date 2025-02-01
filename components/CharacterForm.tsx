import { useState } from 'react'

interface FormData {
  // ... other form fields
  tags: string[]
}

const normalizeTag = (tag: string) => {
  return tag.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
}

export function CharacterForm({ /* ... props ... */ }) {
  const [formData, setFormData] = useState<FormData>({
    // ... initial form state
    tags: []
  })

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }))
  }

  // ... rest of the component
} 