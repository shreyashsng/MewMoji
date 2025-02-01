import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import ClientLayout from '@/components/ClientLayout'
import { MobileNav } from "@/components/MobileNav"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mewmoji - AI Character Chat",
  description: "Chat with expressive AI characters in a cute and playful way",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
          <MobileNav />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
