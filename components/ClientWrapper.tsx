'use client'

import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

function LoadingFallback() {
  return (
    <div className="container py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="w-full aspect-[3/4] rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  )
} 