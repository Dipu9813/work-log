'use client'

import { EventsGrid } from '@/components/events/events-grid'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { Button } from '@/components/ui/button'
import { Settings, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useAppConfig, useUserPermissions } from '@/hooks/use-config'

export default function Home() {
  const { config } = useAppConfig()
  const { hasPermission } = useUserPermissions()

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-base sm:text-base text-gray-600 mt-2">{config.welcome_message}</p>
        </div>
        {config.show_setup_guide && hasPermission('manage_config') && (
          <Link href="/setup" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center justify-center gap-2 w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm">
              <Settings className="h-5 w-5 sm:h-4 sm:w-4" />
              Setup Guide
              <ExternalLink className="h-4 w-4 sm:h-3 sm:w-3" />
            </Button>
          </Link>
        )}
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2">
          <EventsGrid />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
