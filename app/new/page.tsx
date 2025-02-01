'use client'

import CharacterUpload from '@/components/CharacterUpload'
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileJson, Copy, Upload, FormInput, Globe2, Lock } from "lucide-react"
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ClientWrapper } from '@/components/ClientWrapper'

interface CharacterForm {
  name: string
  tagline: string
  system_prompt: string
  greeting: string
  tags: string
  visibility: "Public" | "Private"
}

export default function NewCharacterPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [form, setForm] = useState<CharacterForm>({
    name: '',
    tagline: '',
    system_prompt: '',
    greeting: '',
    tags: '',
    visibility: 'Public'
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Convert form data to character format
      const character = {
        ...form,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        nsfw: false,
        max_tokens: 600,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Insert character into database
      const { data, error } = await supabase
        .from('characters')
        .insert(character)
        .select()
        .single()

      if (error) throw error

      toast.success('Character created successfully!')
      
      // Redirect to the character's chat page
      router.push(`/chat/${data.id}`)
    } catch (error) {
      console.error('Error creating character:', error)
      toast.error('Failed to create character')
    }
  }

  const handleCopyTemplate = () => {
    const template = `{
  "name": "Character Name",
  "tagline": "A brief description",
  "system_prompt": "Detailed personality and behavior...",
  "greeting": "First message in chat",
  "visibility": "Public",
  "tags": ["tag1", "tag2"],
  "nsfw": false,
  "max_tokens": 600
}`
    navigator.clipboard.writeText(template)
    toast.success('Template copied to clipboard')
  }

  return (
    <ClientWrapper>
      <Navbar />
      <main className="min-h-[calc(100vh-3.5rem)] bg-muted/40">
        <div className="container max-w-3xl py-4 sm:py-6 px-4 sm:px-6">
          {/* Header */}
          <div className="flex flex-col gap-6 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Character</h1>
              <p className="text-muted-foreground mt-1">
                Follow these steps to create your AI character
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {/* Step 1: Template */}
            <Card className="overflow-hidden">
              <div className="p-4 sm:p-6 border-b bg-card">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    1
                  </span>
                  <h2 className="font-semibold">Get the template</h2>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="bg-muted rounded-lg p-4 relative">
                  <pre className="text-sm overflow-x-auto font-mono">
                    <code>{`{
  "name": "Character Name",
  "tagline": "Brief description",
  "system_prompt": "Personality...",
  "greeting": "First message",
  "tags": ["tag1", "tag2"],
  "visibility": "Public"
}`}</code>
                  </pre>
                  <Button 
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 opacity-70 hover:opacity-100"
                    onClick={handleCopyTemplate}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Step 2: Instructions */}
            <Card className="overflow-hidden">
              <div className="p-4 sm:p-6 border-b bg-card">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    2
                  </span>
                  <h2 className="font-semibold">Fill in the details</h2>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { field: "name", desc: "Your character's name" },
                    { field: "tagline", desc: "Short, catchy description" },
                    { field: "system_prompt", desc: "Personality & behavior" },
                    { field: "greeting", desc: "First chat message" },
                    { field: "tags", desc: "Search keywords" },
                    { field: "visibility", desc: "Public or Private" }
                  ].map(({ field, desc }) => (
                    <div key={field} className="flex flex-col gap-1">
                      <dt className="text-sm font-medium text-primary">{field}</dt>
                      <dd className="text-sm text-muted-foreground">{desc}</dd>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Step 3: Upload */}
            <Card className="overflow-hidden">
              <div className="p-4 sm:p-6 border-b bg-card">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    3
                  </span>
                  <h2 className="font-semibold">Create your character</h2>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <Tabs defaultValue="form" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="form" className="flex items-center gap-2">
                      <FormInput className="h-4 w-4" />
                      Fill Form
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload JSON
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="form">
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Character name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tagline</label>
                          <Input
                            value={form.tagline}
                            onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                            placeholder="Brief description"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">System Prompt</label>
                        <Textarea
                          value={form.system_prompt}
                          onChange={e => setForm(f => ({ ...f, system_prompt: e.target.value }))}
                          placeholder="Detailed personality and behavior instructions..."
                          className="min-h-[100px]"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Greeting Message</label>
                        <Textarea
                          value={form.greeting}
                          onChange={e => setForm(f => ({ ...f, greeting: e.target.value }))}
                          placeholder="First message in chat..."
                          required
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tags</label>
                          <Input
                            value={form.tags}
                            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                            placeholder="tag1, tag2, tag3"
                          />
                          <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Visibility</label>
                          <Select
                            value={form.visibility}
                            onValueChange={(value) => setForm(f => ({ ...f, visibility: value as "Public" | "Private" }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Public" className="flex items-center gap-2">
                                <Globe2 className="h-4 w-4" />
                                <span>Public</span>
                              </SelectItem>
                              <SelectItem value="Private" className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                <span>Private</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            {form.visibility === 'Public' ? 
                              "Anyone can view and chat with this character" : 
                              "Only you can view and chat with this character"
                            }
                          </p>
                        </div>
                      </div>

                      <Button type="submit" className="w-full">
                        Create Character
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="upload">
                    <CharacterUpload />
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
          </div>

          {/* Example */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              View example character
            </summary>
            <Card className="mt-3 overflow-hidden">
              <div className="p-4 sm:p-6">
                <pre className="text-sm overflow-x-auto bg-muted p-4 rounded-lg">
                  <code>{`{
  "name": "Virian",
  "tagline": "A wanted elf that you're stuck with",
  "system_prompt": "You are Virian, a low-born elf determined to master forbidden magic despite societal restrictions. You are ambitious, scholarly, and slightly bitter about the magical hierarchy.",
  "greeting": "All Virian wanted was to be special. That's it. Granted, maybe he should've stayed in his lane as a commoner.",
  "tags": ["fantasy", "magic", "elf"],
  "visibility": "Public"
}`}</code>
                </pre>
              </div>
            </Card>
          </details>
        </div>
      </main>
    </ClientWrapper>
  )
} 