'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Calendar, Home, Users, FileText, LogOut, User, Settings } from 'lucide-react'
import Lottie from 'lottie-react'
import React, { useState, useEffect } from 'react'
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
      <nav className="bg-gradient-to-r from-[#C5197D] to-[#E91E63] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-6 w-24 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-gradient-to-r from-[#C5197D] to-[#E91E63] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center mr-3">
              <Image
                src="/hult-logo.jpg"
                alt="Hult Logo"
                width={36}
                height={36}
                className="h-9 w-auto object-contain bg-white rounded-lg p-0.5"
                priority
              />
              <span className="ml-2 text-xl font-bold text-white">{config.app_name}</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredNavigation.map((item) => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Home
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'border-white text-white'
                        : 'border-transparent text-white/70 hover:border-white/50 hover:text-white'
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
            <Link href="/profile" className="flex items-center space-x-2 group hover:bg-white/10 px-3 py-2 rounded-lg transition-all">
              <User className="h-5 w-5 text-white/80 group-hover:text-white" />
              <span className="text-sm text-white/90 group-hover:text-white font-medium">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </Link>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleSignOut}
              className="relative h-12 w-32 text-base group overflow-hidden flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all"
            >
              {/* Animation absolutely centered, only visible on hover */}
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                  src="/Animation_-_1700989645104_20251214093310.gif"
                  alt="Sign Out Animation"
                  className="h-8 w-8 object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ display: 'inline-block' }}
                />
              </span>
              {/* Text fades out on hover */}
              <span className="transition-opacity duration-300 group-hover:opacity-0 inline-block z-10 font-medium">
                Sign Out
              </span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}