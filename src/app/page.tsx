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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">{config.welcome_message}</p>
        </div>
        {config.show_setup_guide && hasPermission('manage_config') && (
          <Link href="/setup">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Setup Guide
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
