'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEvents } from '@/hooks/use-database'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { toast } from '@/components/ui/use-toast'

export function EventsGrid() {
  const { events, loading, refetch } = useEvents()
  const [eventStats, setEventStats] = useState<Record<string, { tasksCount: number }>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)


  useEffect(() => {
    if (events.length > 0) {
      fetchEventStats()
    }
  }, [events])

  const fetchEventStats = async () => {
    const stats: Record<string, { tasksCount: number }> = {}
    
    for (const event of events) {
      try {
        const { count: tasksCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)

        stats[event.id] = {
          tasksCount: tasksCount || 0
        }
      } catch (error) {
        console.error('Error fetching stats for event', event.id, error)
        stats[event.id] = { tasksCount: 0 }
      }
    }
    
    setEventStats(stats)
  }

  const getEventStatus = (eventDate: string) => {
    const today = new Date()
    const eventDateObj = new Date(eventDate)
    const diffTime = eventDateObj.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'completed'
    if (diffDays <= 7) return 'active'
    return 'upcoming'
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    upcoming: 'bg-blue-100 text-blue-800'
  }

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (!confirm(`Are you sure you want to delete "${eventName}"? This will also delete all associated tasks, ideas, and work logs.`)) {
      return
    }

    setDeletingId(eventId)
    try {
      // Delete associated data first
      await supabase.from('work_logs').delete().eq('event_id', eventId)
      await supabase.from('tasks').delete().eq('event_id', eventId)
      await supabase.from('ideas').delete().eq('event_id', eventId)
      
      // Delete the event
      const { error } = await supabase.from('events').delete().eq('id', eventId)
      
      if (error) {
        throw error
      }
      
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      })
      
      refetch()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Events</CardTitle>
        <Link href="/events/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No events created yet</p>
              <Link href="/events/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Event
                </Button>
              </Link>
            </div>
          ) : (
            events.slice(0, 5).map((event) => {
              const status = getEventStatus(event.date)
              const stats = eventStats[event.id] || { tasksCount: 0 }
              
              return (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {event.name}
                        </h3>
                        <Badge className={statusColors[status as keyof typeof statusColors]}>
                          {status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div>
                          {stats.tasksCount} tasks
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id, event.name)}
                        disabled={deletingId === event.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}