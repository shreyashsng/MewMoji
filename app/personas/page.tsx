'use client'

import { useEffect, useState } from 'react'
import { usePersona } from '@/contexts/PersonaContext'
import { Button } from '@/components/ui/button'
import { Plus, ChevronLeft, MoreVertical, Pencil, Trash2, UserCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner'
import { ClientWrapper } from '@/components/ClientWrapper'

interface PersonaFormData {
  id: string
  name: string
  background: string
  personality: string
  interests: string
}

interface NewPersonaFormData {
  name: string
  background: string
  personality: string
  interests: string
}

interface Persona {
  id: string
  name: string
  background: string
  personality: string
  interests: string[]
}

const emptyPersona: NewPersonaFormData = {
  name: '',
  background: '',
  personality: '',
  interests: ''
}

const MAX_NAME_LENGTH = 20
const MAX_INTERESTS = 5
const MAX_CHARS = 200

const validateInterests = (interests: string) => {
  const interestList = interests.split(',').map(i => i.trim()).filter(Boolean)
  return interestList.length <= MAX_INTERESTS
}

const validateText = (text: string) => {
  return text.length <= MAX_CHARS
}

const formatInterests = (interests: string) => {
  // Split by comma and get valid interests
  const interestList = interests
    .split(',')
    .map(i => i.trim())
    .filter(Boolean)

  // Only take first 5 valid interests
  const limitedInterests = interestList.slice(0, MAX_INTERESTS)

  // If we're typing a comma at the end, keep it
  const endingComma = interests.endsWith(',') ? ',' : ''

  return limitedInterests.join(', ') + endingComma
}

const FormSection = ({ title, subtitle, children }: { 
  title: string
  subtitle?: string
  children: React.ReactNode 
}) => (
  <div className="space-y-2">
    <div>
      <label className="text-sm font-medium">{title}</label>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </div>
    {children}
  </div>
)

// Add this type definition at the top with other interfaces
type PersonaSetter = {
  (value: PersonaFormData | null): void;
  (value: (prev: PersonaFormData | null) => PersonaFormData | null): void;
} | {
  (value: NewPersonaFormData | null): void;
  (value: (prev: NewPersonaFormData | null) => NewPersonaFormData | null): void;
}

export default function PersonasPage() {
  const { personas, isLoading, loadPersonas, deletePersona, updatePersona, createPersona } = usePersona()
  const router = useRouter()
  const [personaToDelete, setPersonaToDelete] = useState<string | null>(null)
  const [editingPersona, setEditingPersona] = useState<PersonaFormData | null>(null)
  const [newPersona, setNewPersona] = useState<NewPersonaFormData | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadPersonas()
  }, [loadPersonas])

  const handleDelete = async () => {
    if (!personaToDelete) return
    
    try {
      await deletePersona(personaToDelete)
      toast.success('Persona deleted successfully')
    } catch (error) {
      console.error('Error deleting persona:', error)
      toast.error('Failed to delete persona')
    } finally {
      setPersonaToDelete(null)
    }
  }

  const handleEdit = (persona: typeof personas[0]) => {
    setEditingPersona({
      id: persona.id,
      name: persona.name,
      background: persona.background,
      personality: persona.personality,
      interests: persona.interests.join(', ')
    })
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPersona) return
    
    if (editingPersona.name.length > MAX_NAME_LENGTH) {
      toast.error(`Name must be ${MAX_NAME_LENGTH} characters or less`)
      return
    }
    
    if (editingPersona.interests.split(',').filter(Boolean).length > MAX_INTERESTS) {
      toast.error(`Maximum ${MAX_INTERESTS} interests allowed`)
      return
    }
    
    if (!validateText(editingPersona.background)) {
      toast.error(`Background story must be ${MAX_CHARS} characters or less`)
      return
    }
    
    if (!validateText(editingPersona.personality)) {
      toast.error(`Personality description must be ${MAX_CHARS} characters or less`)
      return
    }
    
    setIsSaving(true)
    try {
      await updatePersona(editingPersona.id, {
        name: editingPersona.name,
        background: editingPersona.background,
        personality: editingPersona.personality,
        interests: editingPersona.interests.split(',').map(i => i.trim()).filter(Boolean).slice(0, MAX_INTERESTS)
      })
      toast.success('Persona updated successfully')
      setEditingPersona(null)
    } catch (error) {
      console.error('Error updating persona:', error)
      toast.error('Failed to update persona')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newPersona) return
    
    if (newPersona.name.length > MAX_NAME_LENGTH) {
      toast.error(`Name must be ${MAX_NAME_LENGTH} characters or less`)
      return
    }
    
    if (!validateInterests(newPersona.interests)) {
      toast.error(`Maximum ${MAX_INTERESTS} interests allowed`)
      return
    }
    
    if (!validateText(newPersona.background)) {
      toast.error(`Background story must be ${MAX_CHARS} characters or less`)
      return
    }
    
    if (!validateText(newPersona.personality)) {
      toast.error(`Personality description must be ${MAX_CHARS} characters or less`)
      return
    }

    setIsSaving(true)
    try {
      await createPersona({
        name: newPersona.name,
        background: newPersona.background,
        personality: newPersona.personality,
        interests: newPersona.interests.split(',').map(i => i.trim()).filter(Boolean).slice(0, MAX_INTERESTS)
      })
      toast.success('Persona created successfully')
      setNewPersona(null)
    } catch (error) {
      console.error('Error creating persona:', error)
      toast.error('Failed to create persona')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInterestChange = (
    value: string,
    setter: PersonaSetter
  ) => {
    const isAtLimit = value.split(',').length > MAX_INTERESTS

    // Only format if we're at the limit and not deleting
    if (isAtLimit && value.length > (setter === setEditingPersona ? editingPersona?.interests.length || 0 : newPersona?.interests.length || 0)) {
      if (setter === setEditingPersona) {
        setEditingPersona(prev => prev ? {
          ...prev,
          interests: formatInterests(prev.interests)
        } : null);
      } else {
        setNewPersona(prev => prev ? {
          ...prev,
          interests: formatInterests(prev.interests)
        } : null);
      }
      return;
    }

    // Handle normal input
    if (setter === setEditingPersona) {
      setEditingPersona(prev => prev ? {
        ...prev,
        interests: value
      } : null);
    } else {
      setNewPersona(prev => prev ? {
        ...prev,
        interests: value
      } : null);
    }
  };

  return (
    <ClientWrapper>
      <div className="container max-w-4xl py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Your Personas</h1>
          <p className="text-sm text-muted-foreground">
            Personas help AI characters understand and relate to you better. Create different personas to experience unique interactions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">Your Personas</h1>
          </div>
          <Button 
            className="w-full sm:w-auto justify-center gap-2" 
            onClick={() => setNewPersona(emptyPersona)}
          >
            <Plus className="h-4 w-4" />
            Create New Persona
          </Button>
        </div>

        <div className={cn(
          "grid gap-3 sm:gap-4 lg:gap-6",
          "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
          isLoading && "opacity-50"
        )}>
          {personas.map(persona => (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="relative group overflow-hidden">
                <div className="absolute right-2 top-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(persona)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => setPersonaToDelete(persona.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-base sm:text-lg font-medium ring-2 ring-primary/20">
                      {persona.name[0]}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg sm:text-xl font-semibold truncate">
                        {persona.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                        {persona.personality}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6">
                    <h3 className="text-sm font-medium mb-1">Background</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                      {persona.background}
                    </p>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-1">Interests</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.interests.map(interest => (
                        <span 
                          key={interest} 
                          className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          
          {!isLoading && personas.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <UserCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No personas yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Create a persona to start chatting with different personalities
              </p>
              <Button 
                onClick={() => setNewPersona(emptyPersona)}
                className="w-full sm:w-auto"
              >
                Create Your First Persona
              </Button>
            </div>
          )}
        </div>

        <AlertDialog open={!!personaToDelete} onOpenChange={() => setPersonaToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Persona</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this persona? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!editingPersona} onOpenChange={(open) => !open && setEditingPersona(null)}>
          <DialogContent className="sm:max-w-[600px] p-0">
            <DialogHeader>
              <div className="px-6 py-4 border-b bg-muted/40">
                <DialogTitle>Edit Persona</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Make changes to your persona's profile
                </p>
              </div>
            </DialogHeader>
            
            <form onSubmit={handleSave} className="px-6 py-6 space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormSection 
                  title="Name" 
                  subtitle={`The display name for your persona (${editingPersona?.name.length || 0}/${MAX_NAME_LENGTH})`}
                >
                  <Input
                    value={editingPersona?.name}
                    onChange={e => setEditingPersona(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                    maxLength={MAX_NAME_LENGTH}
                    className="h-9"
                  />
                </FormSection>

                <FormSection 
                  title="Interests"
                  subtitle={`Enter up to ${MAX_INTERESTS} interests, separated by commas`}
                >
                  <Input
                    value={editingPersona?.interests}
                    onChange={e => handleInterestChange(e.target.value, setEditingPersona)}
                    placeholder="reading, hiking, photography"
                    className="h-9"
                  />
                </FormSection>
              </div>

              <FormSection 
                title="Background Story"
                subtitle={`Describe the persona's history (${editingPersona?.background.length || 0}/${MAX_CHARS})`}
              >
                <Textarea
                  value={editingPersona?.background}
                  onChange={e => setEditingPersona(prev => prev ? { ...prev, background: e.target.value } : null)}
                  required
                  maxLength={MAX_CHARS}
                  className="min-h-[120px] resize-none"
                />
              </FormSection>

              <FormSection 
                title="Personality"
                subtitle={`Describe behavior and traits (${editingPersona?.personality.length || 0}/${MAX_CHARS})`}
              >
                <Textarea
                  value={editingPersona?.personality}
                  onChange={e => setEditingPersona(prev => prev ? { ...prev, personality: e.target.value } : null)}
                  required
                  maxLength={MAX_CHARS}
                  className="min-h-[120px] resize-none"
                />
              </FormSection>

              <div className="flex justify-end gap-4 pt-6 mt-8 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingPersona(null)}
                  className="w-24"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-24"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!newPersona} onOpenChange={(open) => !open && setNewPersona(null)}>
          <DialogContent className="sm:max-w-[600px] p-0">
            <DialogHeader>
              <div className="px-6 py-4 border-b bg-muted/40">
                <DialogTitle>Create New Persona</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a new personality for your conversations
                </p>
              </div>
            </DialogHeader>
            
            <form onSubmit={handleCreate} className="px-6 py-6 space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormSection 
                  title="Name" 
                  subtitle={`Choose a name (${newPersona?.name.length || 0}/${MAX_NAME_LENGTH})`}
                >
                  <Input
                    value={newPersona?.name}
                    onChange={e => setNewPersona(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                    maxLength={MAX_NAME_LENGTH}
                    placeholder="Enter persona name"
                    className="h-9"
                  />
                </FormSection>

                <FormSection 
                  title="Interests"
                  subtitle={`Enter up to ${MAX_INTERESTS} interests, separated by commas`}
                >
                  <Input
                    value={newPersona?.interests}
                    onChange={e => handleInterestChange(e.target.value, setNewPersona)}
                    placeholder="reading, hiking, photography"
                    className="h-9"
                  />
                </FormSection>
              </div>

              <FormSection 
                title="Background Story"
                subtitle={`Give your persona a rich history (${newPersona?.background.length || 0}/${MAX_CHARS})`}
              >
                <Textarea
                  value={newPersona?.background}
                  onChange={e => setNewPersona(prev => prev ? { ...prev, background: e.target.value } : null)}
                  required
                  maxLength={MAX_CHARS}
                  placeholder="Describe the persona's background story"
                  className="min-h-[120px] resize-none"
                />
              </FormSection>

              <FormSection 
                title="Personality"
                subtitle={`Define how your persona interacts (${newPersona?.personality.length || 0}/${MAX_CHARS})`}
              >
                <Textarea
                  value={newPersona?.personality}
                  onChange={e => setNewPersona(prev => prev ? { ...prev, personality: e.target.value } : null)}
                  required
                  maxLength={MAX_CHARS}
                  placeholder="Describe the persona's personality traits"
                  className="min-h-[120px] resize-none"
                />
              </FormSection>

              <div className="flex justify-end gap-4 pt-6 mt-8 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewPersona(null)}
                  className="w-24"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-24"
                >
                  {isSaving ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ClientWrapper>
  )
} 