'use client'

import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-background p-4 rounded-lg shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  )
} 