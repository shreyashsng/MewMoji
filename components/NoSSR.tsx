'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Skeleton } from './ui/skeleton'

function Loading() {
  return (
    <div className="container py-6">
      <Skeleton className="w-full h-[200px] rounded-lg" />
    </div>
  )
}

const NoSSR = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}

export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false
}) 