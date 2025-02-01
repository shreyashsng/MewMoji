'use client'

import { useEffect, useState } from 'react'
import { usePersona } from '@/contexts/PersonaContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function EditPersonaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { personas, updatePersona } = usePersona()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    background: '',
    personality: '',
    interests: ''
  })

  useEffect(() => {
    const persona = personas.find(p => p.id === params.id)
    if (!persona) {
      router.push('/personas')
      return
    }

    setFormData({
      name: persona.name,
      background: persona.background,
      personality: persona.personality,
      interests: persona.interests.join(', ')
    })
  }, [params.id, personas, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updatePersona(params.id, {
        ...formData,
        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean)
      })
      toast.success('Persona updated successfully')
      router.push('/personas')
    } catch (error) {
      console.error('Error updating persona:', error)
      toast.error('Failed to update persona')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container max-w-2xl py-6">
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Persona</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Background</label>
            <Textarea
              name="background"
              value={formData.background}
              onChange={e => setFormData(prev => ({ ...prev, background: e.target.value }))}
              required
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Personality</label>
            <Textarea
              name="personality"
              value={formData.personality}
              onChange={e => setFormData(prev => ({ ...prev, personality: e.target.value }))}
              required
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Interests</label>
            <Input
              name="interests"
              value={formData.interests}
              onChange={e => setFormData(prev => ({ ...prev, interests: e.target.value }))}
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  )
} 