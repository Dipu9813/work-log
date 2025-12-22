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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-[#D91A7A]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="h-20 w-20 bg-gradient-to-br from-[#D91A7A] to-[#E91E63] rounded-full opacity-20 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  // Show auth pages without navbar
  if (isAuthPage) {
    return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">{children}</div>
  }

  // Show protected content with navbar
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Top navbar hidden on mobile */}
        <div className="hidden sm:block">
          <Navbar />
        </div>
        {/* Mobile logo and profile avatar on the same row */}
        <div className="sm:hidden flex items-center justify-between pt-4 pb-2 px-4 bg-gradient-to-r from-[#C5197D] to-[#E91E63]">
          <img
            src="/hult-logo.jpg"
            alt="Hult Logo"
            className="h-12 w-auto object-contain drop-shadow-lg bg-white rounded-lg p-1"
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