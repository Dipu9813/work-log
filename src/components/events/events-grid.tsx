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
    active: 'bg-[#56C02B] text-white font-semibold',
    completed: 'bg-gray-400 text-white font-semibold',
    upcoming: 'bg-[#00BFE8] text-white font-semibold'
  }

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (!confirm(`Are you sure you want to delete "${eventName}"? This will also delete all associated tasks, ideas, and work logs.`)) {
      return
    }

    setDeletingId(eventId)
    
    // Use setTimeout to prevent UI blocking
    setTimeout(async () => {
      try {
        console.log('🗑️ Starting optimized event deletion from grid...', eventId)
        
        // Delete associated data in parallel for better performance
        console.log('🔄 Deleting associated data in parallel...')
        const [workLogsResult, tasksResult, ideasResult] = await Promise.allSettled([
          supabase.from('work_logs').delete().eq('event_id', eventId),
          supabase.from('tasks').delete().eq('event_id', eventId),
          supabase.from('ideas').delete().eq('event_id', eventId)
        ])
        
        // Log results but continue even if some deletions had issues
        console.log('📊 Associated data deletion results:', {
          workLogs: workLogsResult,
          tasks: tasksResult, 
          ideas: ideasResult
        })
        
        // Delete the event
        console.log('🔄 Deleting event...')
        const { error } = await supabase.from('events').delete().eq('id', eventId)
        
        if (error) {
          console.error('❌ Event deletion error:', error)
          throw error
        }
        
        console.log('✅ Event deleted successfully')
        toast({
          title: 'Success',
          description: 'Event deleted successfully',
        })
        
        refetch()
      } catch (error) {
        console.error('💥 Error deleting event:', error)
        toast({
          title: 'Error',
          description: `Failed to delete event: ${(error as any)?.message || 'Unknown error'}`,
          variant: 'destructive',
        })
      } finally {
        setDeletingId(null)
      }
    }, 50) // Small delay to allow UI to update
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
    <Card className="shadow-lg border-t-4 border-[#D91A7A]">
      <CardHeader className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-gradient-to-r from-pink-50 to-white">
        <CardTitle className="text-xl sm:text-lg font-bold text-[#E91E63]">Recent Events</CardTitle>
        <Link href="/events/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-12 sm:h-9 text-base sm:text-sm bg-gradient-to-r from-[#D91A7A] to-[#E91E63] hover:from-[#C5197D] hover:to-[#D91A7A] shadow-md">
            <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
            New Event
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          {events.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-500 mb-6 text-base">No events created yet</p>
              <Link href="/events/new">
                <Button className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm">
                  <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                  Create Your First Event
                </Button>
              </Link>
            </div>
          ) : (
            events.slice(0, 5).map((event) => {
              const status = getEventStatus(event.date)
              const stats = eventStats[event.id] || { tasksCount: 0 }
              
              return (
                <div key={event.id} className="border-2 border-pink-100 rounded-xl p-4 sm:p-6 hover:shadow-xl hover:border-[#D91A7A]/30 transition-all duration-300 bg-gradient-to-br from-white to-pink-50/30">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                          {event.name}
                        </h3>
                        <Badge className={statusColors[status as keyof typeof statusColors]}>
                          {status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base mb-4 leading-relaxed">{event.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 font-medium">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-[#D91A7A]" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-[#00BFE8]" />
                          {stats.tasksCount} tasks
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 sm:gap-3 sm:items-end">
                      <Link href={`/events/${event.id}`} className="flex-1 sm:flex-none">
                        <Button variant="default" className="w-full sm:w-auto h-11 sm:h-9 text-sm font-semibold">
                          View Details
                        </Button>
                      </Link>
                      <div className="flex gap-2 sm:gap-4 sm:mt-2">
                        <Link href={`/events/${event.id}/edit`}>
                          <Button
                            variant="outline"
                            className="h-11 w-11 sm:h-12 sm:w-12 p-0 border-[#00BFE8] border-2 bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 shadow-md transition duration-150 ease-in-out flex items-center justify-center"
                          >
                            <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-[#00BFE8]" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteEvent(event.id, event.name)}
                          disabled={deletingId === event.id}
                          className="text-red-600 hover:text-red-700 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 h-11 w-11 sm:h-12 sm:w-12 p-0 border-red-400 border-2 shadow-md transition duration-150 ease-in-out flex items-center justify-center"
                        >
                          <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
                        </Button>
                      </div>
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