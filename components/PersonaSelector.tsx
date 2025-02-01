'use client'

import { usePersona } from '@/contexts/PersonaContext'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { UserCircle } from 'lucide-react'
import { useEffect } from 'react'

export function PersonaSelector() {
  const { personas, currentPersona, setCurrentPersona, loadPersonas } = usePersona()

  useEffect(() => {
    loadPersonas()
  }, [loadPersonas])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <UserCircle className="h-4 w-4" />
          {currentPersona?.name || 'Select Persona'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {personas.map(persona => (
          <DropdownMenuItem
            key={persona.id}
            onClick={() => setCurrentPersona(persona)}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
              {persona.name[0]}
            </div>
            <span>{persona.name}</span>
          </DropdownMenuItem>
        ))}
        {personas.length > 0 && (
          <DropdownMenuSeparator />
        )}
        <DropdownMenuItem onClick={() => setCurrentPersona(null)}>
          Reset Persona
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 