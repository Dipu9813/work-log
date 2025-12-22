'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Home, FileText } from 'lucide-react'
import { useNavigation } from '@/hooks/use-config'

const iconMap = {
  Home,
  Calendar,
  FileText
}

export function MobileNavbar() {
  const pathname = usePathname()
  const { navigation } = useNavigation()

  // Only show main nav items (Dashboard, Events, Work Logs)
  const mainNav = navigation.filter(item =>
    ['/', '/events', '/work-logs'].includes(item.href)
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#C5197D] to-[#E91E63] shadow-2xl flex sm:hidden">
      {mainNav.map((item) => {
        const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Home
        const isActive = pathname === item.href
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-3 transition-all ${
              isActive ? 'text-white bg-white/20' : 'text-white/70'
            }`}
          >
            <IconComponent className="h-6 w-6 mb-1" />
            <span className="text-xs font-semibold">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
