'use client'

import { useEffect } from 'react'
import { RouteTransition } from '@/components/RouteTransition'
import { Footer } from '@/components/Footer'
import { usePathname } from 'next/navigation'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isChat = pathname.startsWith('/chat')

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  if (window.confirm('New version available! Reload to update?')) {
                    newWorker.postMessage({ type: 'skipWaiting' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <>
      <RouteTransition />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          {children}
        </main>
        {!isChat && <Footer />}
      </div>
    </>
  )
} 