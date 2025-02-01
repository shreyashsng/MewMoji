'use client'

import { useState } from 'react'
import { usePersona } from '@/contexts/PersonaContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { ClientWrapper } from '@/components/ClientWrapper'

export default function NewPersonaPage() {
  const router = useRouter()
  const { createPersona } = usePersona()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const interests = formData.get('interests')?.toString().split(',').map(i => i.trim()) || []

    try {
      await createPersona({
        name: formData.get('name')?.toString() || '',
        background: formData.get('background')?.toString() || '',
        personality: formData.get('personality')?.toString() || '',
        interests
      })
      toast.success('Persona created successfully')
      router.push('/personas')
    } catch (error) {
      console.error('Error creating persona:', error)
      toast.error('Failed to create persona')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ClientWrapper>
      <main className="container max-w-2xl py-6">
        <h1 className="text-3xl font-bold mb-8">Create New Persona</h1>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input name="name" required placeholder="Your persona's name" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Background</label>
              <Textarea 
                name="background" 
                required 
                placeholder="Brief background story of your persona"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Personality</label>
              <Textarea 
                name="personality" 
                required 
                placeholder="Describe your persona's personality traits"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Interests</label>
              <Input 
                name="interests" 
                placeholder="Comma-separated list of interests" 
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Example: reading, hiking, photography
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Persona'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </ClientWrapper>
  )
} 