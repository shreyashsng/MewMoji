'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Footer() {
  const pathname = usePathname()
  
  // Don't show footer in chat interface
  if (pathname.startsWith('/chat')) {
    return null
  }

  return (
    <footer className={cn(
      "border-t py-6 md:py-0",
      // Add bottom padding on mobile to prevent overlap with nav bar
      "pb-24 sm:pb-6"
    )}>
      <div className="container flex flex-col items-center gap-4 md:h-24 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            The first truly free AI character chatbot.
            by {" "}
            <a
              href="https://x.com/shreyashsng"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              shreyash
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
} 