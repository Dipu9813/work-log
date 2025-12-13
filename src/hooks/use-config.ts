'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'

export interface AppConfig {
  app_name: string
  app_description: string
  welcome_message: string
  company_logo_url?: string
  primary_color?: string
  show_setup_guide: boolean
  enable_team_features: boolean
  default_user_role: 'admin' | 'manager' | 'member'
}

export interface NavigationItem {
  id: string
  name: string
  href: string
  icon: string
  order_index: number
  is_active: boolean
  required_permission?: string
}

const defaultConfig: AppConfig = {
  app_name: 'WorkLogs',
  app_description: 'Track your work efficiently',
  welcome_message: 'Welcome to your work logs tracking system',
  show_setup_guide: true,
  enable_team_features: true,
  default_user_role: 'member'
}

const defaultNavigation: NavigationItem[] = [
  { id: '1', name: 'Dashboard', href: '/', icon: 'Home', order_index: 1, is_active: true },
  { id: '2', name: 'Events', href: '/events', icon: 'Calendar', order_index: 2, is_active: true },
  { id: '3', name: 'Work Logs', href: '/work-logs', icon: 'FileText', order_index: 3, is_active: true },
  { id: '4', name: 'Team', href: '/team', icon: 'Users', order_index: 4, is_active: true, required_permission: 'view_team' },
  { id: '5', name: 'Settings', href: '/settings', icon: 'Settings', order_index: 5, is_active: true, required_permission: 'manage_config' },
]

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)
  const [loading, setLoading] = useState(false)

  // For now, return static config until we set up the database tables
  // TODO: Implement database-backed configuration after creating tables
  const updateConfig = async (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    return true
  }

  return {
    config,
    loading,
    updateConfig,
    refetch: () => Promise.resolve()
  }
}

export function useNavigation() {
  const [navigation, setNavigation] = useState<NavigationItem[]>(defaultNavigation)
  const [loading, setLoading] = useState(false)

  // For now, return static navigation until we set up the database tables
  const updateNavigationItem = async (item: Partial<NavigationItem> & { id: string }) => {
    setNavigation(prev => 
      prev.map(nav => nav.id === item.id ? { ...nav, ...item } : nav)
    )
    return true
  }

  return {
    navigation,
    loading,
    updateNavigationItem,
    refetch: () => Promise.resolve()
  }
}

export function useUserPermissions() {
  const [permissions, setPermissions] = useState<string[]>(['view_own', 'edit_own'])
  const [role, setRole] = useState<'admin' | 'manager' | 'member'>('member')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserPermissions()
  }, [])

  const fetchUserPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      // Get role from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
      } else if (profileData) {
        const profileRole = (profileData as any).role as 'admin' | 'manager' | 'member'
        setRole(profileRole)
        
        // Set default permissions based on role
        const defaultPermissions = getDefaultPermissions(profileRole)
        setPermissions(defaultPermissions)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDefaultPermissions = (role: string): string[] => {
    switch (role) {
      case 'admin':
        return ['view_all', 'edit_all', 'delete_all', 'manage_users', 'view_team', 'manage_config']
      case 'manager':
        return ['view_all', 'edit_own', 'create_events', 'view_team', 'assign_tasks']
      case 'member':
        return ['view_own', 'edit_own', 'create_work_logs']
      default:
        return ['view_own']
    }
  }

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission) || permissions.includes('view_all')
  }

  return {
    permissions,
    role,
    loading,
    hasPermission,
    refetch: fetchUserPermissions
  }
}