'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Calendar, Home, Users, FileText, LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useNavigation, useUserPermissions, useAppConfig } from '@/hooks/use-config'

// Icon mapping
const iconMap = {
  Home,
  Calendar,
  FileText,
  Users,
  User,
  Settings
}

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { navigation, loading: navLoading } = useNavigation()
  const { hasPermission } = useUserPermissions()
  const { config } = useAppConfig()

  const handleSignOut = async () => {
    await signOut()
  }

  // Filter navigation items based on permissions
  const filteredNavigation = navigation.filter(item => {
    if (item.required_permission) {
      return hasPermission(item.required_permission)
    }
    return true
  })

  if (navLoading) {
    return (
      <nav className="bg-white shadow-sm border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-6 w-24 bg-pink-100 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b border-pink-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center mr-3">
              <Image
                src="/hult-logo.jpg"
                alt="Hult Logo"
                width={36}
                height={36}
                className="h-9 w-auto object-contain"
                priority
              />
              <span className="ml-2 text-xl font-bold text-pink-700">{config.app_name}</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredNavigation.map((item) => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Home
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-pink-500 text-pink-900'
                        : 'border-transparent text-pink-400 hover:border-pink-200 hover:text-pink-700'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/profile" className="flex items-center space-x-2 group hover:bg-pink-50 px-2 py-1 rounded">
              <User className="h-5 w-5 text-pink-400 group-hover:text-pink-600" />
              <span className="text-sm text-pink-700 group-hover:text-pink-600">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}