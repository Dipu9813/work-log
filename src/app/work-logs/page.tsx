'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Clock, User } from 'lucide-react'
import { useWorkLogs, useEvents } from '@/hooks/use-database'
import { supabase } from '@/lib/supabase'
import { toast } from '@/components/ui/use-toast'

export default function WorkLogsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    event_id: '',
    task_id: '',
    description: ''
  })
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const { workLogs, loading, createWorkLog } = useWorkLogs()
  const { events } = useEvents()
  const [tasks, setTasks] = useState<any[]>([])


  // Fetch current user on component mount
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  // Fetch tasks when event is selected
  useEffect(() => {
    if (formData.event_id) {
      fetchTasksForEvent(formData.event_id)
    }
  }, [formData.event_id])

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single()
        setCurrentUser(profile)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const fetchTasksForEvent = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('event_id', eventId)

      if (error) {
        console.error('Error fetching tasks:', error)
        toast({
          title: 'Error',
          description: 'Failed to load tasks for this event',
          variant: 'destructive'
        })
        setTasks([])
      } else {
        setTasks(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setTasks([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'Please log in to submit work logs.',
        variant: 'destructive',
      })
      return
    }

    // Validate required fields
    if (!formData.event_id || !formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please select an event and enter a description.',
        variant: 'destructive',
      })
      return
    }
    
    try {
      const workLogData = {
        event_id: formData.event_id,
        task_id: formData.task_id || undefined,
        description: formData.description.trim(),
        person: currentUser?.full_name || currentUser?.email || 'Unknown User'
      }

      console.log('📤 Submitting work log:', workLogData)

      const result = await createWorkLog(workLogData)
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Work log submitted successfully!',
        })
        setShowForm(false)
        setFormData({
          event_id: '',
          task_id: '',
          description: ''
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to submit work log. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      console.error('❌ Error submitting work log:', error)
      toast({
        title: 'Error',
        description: error?.message || 'An unexpected error occurred while creating work log.',
        variant: 'destructive',
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-pink-600">Work Logs</h1>
          <p className="text-pink-400">Track daily work progress and submissions</p>
        </div>
        <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Work Log'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Work Log</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event" className="block text-sm font-medium text-pink-700 mb-2">
                    Select Event
                  </label>
                  <select
                    id="event"
                    name="event_id"
                    required
                    value={formData.event_id}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-pink-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
                  >
                    <option value="">Choose an event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="task" className="block text-sm font-medium text-pink-700 mb-2">
                    Select Task (Optional)
                  </label>
                  <select
                    id="task"
                    name="task_id"
                    value={formData.task_id}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-pink-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
                    disabled={!formData.event_id}
                  >
                    <option value="">Choose a task (optional)</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-pink-700">
                    <User className="h-4 w-4 inline mr-2" />
                    Submitting as: <strong>{currentUser?.full_name || currentUser?.email || 'Loading...'}</strong>
                  </p>
                </div>
              </div>



              <div>
                <label htmlFor="description" className="block text-sm font-medium text-pink-700 mb-2">
                  Work Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what work you completed"
                  className="flex w-full rounded-md border border-pink-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-pink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
                />
              </div>

              {/* Proof Upload removed as requested */}

              <div className="flex space-x-4">
                  <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white">
                  Submit Work Log
                </Button>
                  <Button type="button" variant="outline" className="border-violet-300 text-violet-600" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Work Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-pink-100 h-32 rounded-lg"></div>
              ))}
            </div>
          ) : workLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-pink-400 mb-4">No work logs submitted yet</p>
                <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Your First Work Log
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {workLogs.map((log) => (
                <div key={log.id} className="border border-pink-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-pink-100 rounded-full">
                        <FileText className="h-4 w-4 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-pink-500">
                          {log.event_name || 'Unknown Event'}
                        </h3>
                        {log.task_name && log.task_name !== 'General' && (
                          <p className="text-sm text-black">Task: {log.task_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-pink-500">
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-black mb-4">{log.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-black">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {log.person}
                      </div>

                      {log.attachment_path && (
                        <Badge variant="secondary">
                          📎 {log.attachment_path.split('/').pop()}
                        </Badge>
                      )}
                    </div>
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