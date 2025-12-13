import { EventsGrid } from '@/components/events/events-grid'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function EventsPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-base sm:text-base text-gray-600 mt-2">Manage and track all your organization events</p>
        </div>
        <Link href="/events/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm font-medium">
            <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      <EventsGrid />
    </div>
  )
}