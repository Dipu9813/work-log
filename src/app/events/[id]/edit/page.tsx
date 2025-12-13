"use client"

// --- Work Log Deletion ---
import { Trash2 } from 'lucide-react'

// ...existing code...



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
  // Work log state (moved inside component)
  const [workLogs, setWorkLogs] = useState<any[]>([]);
  const [deletingWorkLogId, setDeletingWorkLogId] = useState<string | null>(null);
  // Fetch work logs for this event
  useEffect(() => {
    const fetchWorkLogs = async () => {
      if (!resolvedParams?.id) return;
      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('event_id', resolvedParams.id)
        .order('created_at', { ascending: false });
      if (!error && data) setWorkLogs(data);
    };
    if (resolvedParams?.id) fetchWorkLogs();
  }, [resolvedParams, deletingWorkLogId]);

  // Work log delete handler
  const handleDeleteWorkLog = (logId: string) => {
    if (!confirm('Are you sure you want to delete this work log?')) return;
    setDeletingWorkLogId(logId);
    // Optimistically remove from UI
    setWorkLogs((prev) => prev.filter((log) => log.id !== logId));
    // Run DB delete in background
    (async () => {
      try {
        const { error, data } = await supabase.from('work_logs').delete().eq('id', logId);
        if (error) {
          console.error('Supabase delete error:', error, 'logId:', logId);
          throw error;
        }
        toast({ title: 'Success', description: 'Work log deleted.' });
      } catch (error: any) {
        console.error('Failed to delete work log:', error, 'logId:', logId);
        toast({ title: 'Error', description: `Failed to delete work log: ${error?.message || error}`, variant: 'destructive' });
        // Optionally restore the log if needed (not implemented here)
      } finally {
        setDeletingWorkLogId(null);
      }
    })();
  };

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

  // Delete event and all associated data
  const handleDeleteEvent = async () => {
    if (!resolvedParams?.id || !formData.name) return;
    const confirmMessage = `Are you sure you want to delete "${formData.name}"? This will also delete all associated tasks, ideas, and work logs. This action cannot be undone.`;
    if (!confirm(confirmMessage)) return;
    setDeleting(true);
    try {
      // Delete associated work logs, tasks, and ideas first
      const [workLogsResult, tasksResult, ideasResult] = await Promise.allSettled([
        supabase.from('work_logs').delete().eq('event_id', resolvedParams.id),
        supabase.from('tasks').delete().eq('event_id', resolvedParams.id),
        supabase.from('ideas').delete().eq('event_id', resolvedParams.id)
      ]);
      // Log results for debugging
      console.log('Associated data deletion results:', { workLogsResult, tasksResult, ideasResult });
      // Delete the event itself
      const { error } = await supabase.from('events').delete().eq('id', resolvedParams.id);
      if (error) {
        console.error('Event deletion error:', error);
        toast({ title: 'Error', description: `Failed to delete event: ${error.message || error}`, variant: 'destructive' });
        setDeleting(false);
        return;
      }
      toast({ title: 'Success', description: 'Event deleted successfully' });
      router.push('/events');
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({ title: 'Error', description: `Failed to delete event: ${error?.message || error}`, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

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
                onClick={handleDeleteEvent}
                disabled={deleting || loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Delete Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Work Logs Section */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Work Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {workLogs.length === 0 ? (
            <div className="text-gray-500 text-center py-6">No work logs for this event.</div>
          ) : (
            <div className="space-y-4">
              {workLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between border rounded px-4 py-3">
                  <div>
                    <div className="font-medium text-pink-700">{log.person}</div>
                    <div className="text-gray-700 text-sm mt-1">{log.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Edit button (optional, if you have edit functionality) */}
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:inline-flex text-blue-500 hover:text-blue-700 p-2"
                      title="Edit work log"
                    >
                      <Edit className="h-5 w-5" />
                    </Button> */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWorkLog(log.id)}
                      disabled={deletingWorkLogId === log.id}
                      className="text-red-600 hover:text-red-700 p-2 transition-colors duration-150 hidden md:inline-flex"
                      title="Delete work log"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                    {/* Mobile: show as before */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWorkLog(log.id)}
                      disabled={deletingWorkLogId === log.id}
                      className="text-red-600 hover:text-red-700 md:hidden"
                      title="Delete work log"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}