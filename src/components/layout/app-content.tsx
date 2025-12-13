'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Navbar } from '@/components/layout/navbar'
import { MobileNavbar } from '@/components/layout/mobile-navbar'
import { MobileProfileAvatar } from '@/components/layout/mobile-profile-avatar'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { usePWA } from '@/hooks/use-pwa'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  
  // Initialize PWA functionality
  usePWA()
  
  const isAuthPage = pathname?.startsWith('/auth')

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.push('/auth/login')
    }
  }, [user, loading, isAuthPage, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  // Show auth pages without navbar
  if (isAuthPage) {
    return <div className="min-h-screen bg-white">{children}</div>
  }

  // Show protected content with navbar
  if (user) {
    return (
      <div className="min-h-screen bg-white">
        {/* Top navbar hidden on mobile */}
        <div className="hidden sm:block">
          <Navbar />
        </div>
        {/* Mobile logo and profile avatar on the same row */}
        <div className="sm:hidden flex items-center justify-between pt-4 pb-2 px-4">
          <img
            src="/hult-logo.jpg"
            alt="Hult Logo"
            className="h-12 w-auto object-contain drop-shadow"
            style={{ maxWidth: 80 }}
          />
          <div>
            <MobileProfileAvatar />
          </div>
        </div>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-8 max-w-7xl">
          {children}
        </main>
        {/* Bottom navbar only on mobile */}
        <MobileNavbar />
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>
    )
  }

  return null
}