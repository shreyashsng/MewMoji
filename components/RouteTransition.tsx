'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function RouteTransition() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 500)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/80"
      initial={{ scaleX: 0, transformOrigin: '0% 50%' }}
      animate={{ 
        scaleX: isNavigating ? 1 : 0,
        transformOrigin: isNavigating ? '0% 50%' : '100% 50%'
      }}
      transition={{ duration: 0.5 }}
    />
  )
} 