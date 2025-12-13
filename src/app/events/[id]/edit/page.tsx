'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { toast } from '@/components/ui/use-toast'

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: ''
  })

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchEventData()
    }
  }, [resolvedParams])

  const fetchEventData = async () => {
    if (!resolvedParams?.id) return

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (error) {
        console.error('Error fetching event:', error)
        toast({
          title: 'Error',
          description: 'Failed to load event data',
          variant: 'destructive',
        })
        router.push('/events')
        return
      }

      if (data) {
        setFormData({
          name: (data as any).name || '',
          date: (data as any).date ? new Date((data as any).date).toISOString().split('T')[0] : '',
          description: (data as any).description || ''
        })
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resolvedParams?.id) return

    try {
      const { error } = await (supabase as any)
        .from('events')
        .update({
          name: formData.name,
          date: formData.date,
          description: formData.description
        })
        .eq('id', resolvedParams.id)

      if (error) {
        console.error('Error updating event:', error)
        toast({
          title: 'Error',
          description: 'Failed to update event',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Event updated successfully',
      })

      router.push(`/events/${resolvedParams.id}`)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleDelete = async () => {
    if (!resolvedParams?.id || !formData.name) return

    const confirmMessage = `Are you sure you want to delete "${formData.name}"? This will also delete all associated tasks, ideas, and work logs. This action cannot be undone.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    setDeleting(true)
    
    // Use setTimeout to prevent UI blocking
    setTimeout(async () => {
      try {
        console.log('🗑️ Starting optimized event deletion...')
        
        // Delete associated data in parallel for better performance
        console.log('🔄 Deleting associated data in parallel...')
        const [workLogsResult, tasksResult, ideasResult] = await Promise.allSettled([
          supabase.from('work_logs').delete().eq('event_id', resolvedParams.id),
          supabase.from('tasks').delete().eq('event_id', resolvedParams.id),
          supabase.from('ideas').delete().eq('event_id', resolvedParams.id)
        ])
        
        // Log results but don't fail if some deletions had issues
        console.log('📊 Associated data deletion results:', {
          workLogs: workLogsResult,
          tasks: tasksResult,
          ideas: ideasResult
        })
        
        // Delete the event
        console.log('🔄 Deleting event...')
        const { error } = await supabase.from('events').delete().eq('id', resolvedParams.id)
        
        if (error) {
          console.error('❌ Event deletion error:', error)
          throw error
        }
        
        console.log('✅ Event deleted successfully')
        toast({
          title: 'Success',
          description: 'Event deleted successfully',
        })
        
        router.push('/events')
      } catch (error) {
        console.error('💥 Error deleting event:', error)
        toast({
          title: 'Error',
          description: `Failed to delete event: ${(error as any)?.message || 'Unknown error'}`,
          variant: 'destructive',
        })
      } finally {
        setDeleting(false)
      }
    }, 50) // Small delay to allow UI to update
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/events/${resolvedParams?.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-gray-600">Update event details</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Event Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter event name"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Event Date
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event"
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex justify-between">
              <div className="flex space-x-4">
                <Button type="submit">
                  Update Event
                </Button>
                <Link href={`/events/${resolvedParams?.id}`}>
                  <Button variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
              <Button 
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting || loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Delete Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}