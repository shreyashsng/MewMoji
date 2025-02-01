'use client'

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Chrome, Github } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { motion } from "framer-motion"
import Image from "next/image"
import { useTheme } from "next-themes"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signInWithGoogle, loading } = useAuth()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-16 h-16 rounded-2xl bg-background/95 backdrop-blur shadow-lg flex items-center justify-center">
              <Image 
                src="/logo-auth-dark.svg" 
                alt="Logo" 
                width={40} 
                height={40}
                className={`rounded-lg ${useTheme().theme === 'dark' ? 'invert' : ''}`}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 to-transparent" />
            </div>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Log in to chat with any personality in the world.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full h-11 text-base" 
              onClick={signInWithGoogle}
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  <Chrome className="mr-2 h-5 w-5" />
                  Continue with Google
                </>
              )}
            </Button>

          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 