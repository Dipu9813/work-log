'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Clock, User, Edit, Trash2, Save, X } from 'lucide-react'
import { useWorkLogs, useEvents } from '@/hooks/use-database'
import { supabase } from '@/lib/supabase'
import { toast } from '@/components/ui/use-toast'

export default function WorkLogsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    event_id: '',
    task_id: '',
    description: '',
    your_name: ''
  })
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState({ description: '', your_name: '' })
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const { workLogs, loading, createWorkLog, refetch } = useWorkLogs()
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
        
        // Store both user and profile data
        const userData = { ...profile, id: user.id, email: user.email }
        setCurrentUser(userData)
        
        // Auto-populate the name field
        const userName = profile?.full_name || profile?.email || user.email || 'Your Name'
        setFormData(prev => ({ ...prev, your_name: userName }))
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
        person: formData.your_name.trim() || currentUser?.full_name || currentUser?.email || 'Unknown User'
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
          description: '',
          your_name: currentUser?.full_name || currentUser?.email || ''
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

  // Check if current user can edit this work log
  const canEditWorkLog = (log: any) => {
    if (!currentUser) return false
    return log.person_id === currentUser.id
  }

  const startEditWorkLog = (log: any) => {
    if (!canEditWorkLog(log)) {
      toast({
        title: 'Permission Denied',
        description: 'You can only edit your own work logs.',
        variant: 'destructive',
      })
      return
    }
    
    setEditingId(log.id)
    setEditData({
      your_name: log.name || log.person || '',
      description: log.description || ''
    })
  }

  const saveEditWorkLog = async () => {
    if (!editingId) return

    try {
      const { error } = await supabase
        .from('work_logs')
        .update({
          name: editData.your_name.trim(),
          description: editData.description.trim()
        })
        .eq('id', editingId)

      if (error) {
        throw error
      }

      toast({
        title: 'Success',
        description: 'Work log updated successfully',
      })

      setEditingId(null)
      setEditData({ your_name: '', description: '' })
      refetch()
    } catch (error) {
      console.error('Error updating work log:', error)
      toast({
        title: 'Error',
        description: 'Failed to update work log',
        variant: 'destructive',
      })
    }
  }

  const cancelEditWorkLog = () => {
    setEditingId(null)
    setEditData({ your_name: '', description: '' })
  }

  const deleteWorkLog = async (logId: string, log: any) => {
    if (!canEditWorkLog(log)) {
      toast({
        title: 'Permission Denied',
        description: 'You can only delete your own work logs.',
        variant: 'destructive',
      })
      return
    }

    if (!confirm('Are you sure you want to delete this work log?')) {
      return
    }

    setDeletingId(logId)
    try {
      const { error } = await supabase
        .from('work_logs')
        .delete()
        .eq('id', logId)

      if (error) {
        throw error
      }

      toast({
        title: 'Success',
        description: 'Work log deleted successfully',
      })

      refetch()
    } catch (error) {
      console.error('Error deleting work log:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete work log',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-600">Work Logs</h1>
          <p className="text-sm sm:text-base text-pink-400">Track daily work progress and submissions</p>
        </div>
        <Button 
          className="bg-pink-500 hover:bg-pink-600 text-white w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm" 
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Work Log'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Work Log</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="event" className="block text-sm font-medium text-pink-700 mb-3">
                    Select Event
                  </label>
                  <select
                    id="event"
                    name="event_id"
                    required
                    value={formData.event_id}
                    onChange={handleInputChange}
                    className="flex h-12 sm:h-10 w-full rounded-md border border-pink-200 bg-white px-4 py-3 sm:px-3 sm:py-2 text-base sm:text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
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
                  <label htmlFor="task" className="block text-sm font-medium text-pink-700 mb-3">
                    Select Task (Optional)
                  </label>
                  <select
                    id="task"
                    name="task_id"
                    value={formData.task_id}
                    onChange={handleInputChange}
                    className="flex h-12 sm:h-10 w-full rounded-md border border-pink-200 bg-white px-4 py-3 sm:px-3 sm:py-2 text-base sm:text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
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

              <div>
                <label htmlFor="your_name" className="block text-sm font-medium text-pink-700 mb-3">
                  Your Name
                </label>
                <Input
                  id="your_name"
                  name="your_name"
                  type="text"
                  required
                  value={formData.your_name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="border-pink-200 focus:ring-pink-400 focus:border-pink-400 h-12 sm:h-10 px-4 sm:px-3 text-base sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-pink-700 mb-3">
                  Work Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what work you completed"
                  className="flex w-full rounded-md border border-pink-200 bg-white px-4 py-3 sm:px-3 sm:py-2 text-base sm:text-sm ring-offset-white placeholder:text-pink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white h-12 sm:h-10 text-base sm:text-sm font-medium">
                  Submit Work Log
                </Button>
                <Button type="button" variant="outline" className="border-violet-300 text-violet-600 h-12 sm:h-10 text-base sm:text-sm" onClick={() => setShowForm(false)}>
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
            <div className="space-y-4 sm:space-y-6">
              {workLogs.map((log) => (
                <div key={log.id} className="border border-pink-100 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 bg-pink-100 rounded-full flex-shrink-0">
                        <FileText className="h-5 w-5 sm:h-4 sm:w-4 text-pink-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-pink-500 text-base sm:text-sm">
                          {log.event_name || 'Unknown Event'}
                        </h3>
                        {log.task_name && log.task_name !== 'General' && (
                          <p className="text-sm text-black mt-1">Task: {log.task_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-sm text-pink-500 flex-shrink-0">
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditWorkLog(log)}
                          disabled={!canEditWorkLog(log)}
                          className={`${canEditWorkLog(log) ? "text-pink-600 hover:text-pink-700" : "text-gray-400 cursor-not-allowed"} h-9 w-9 sm:h-8 sm:w-8 p-0`}
                          title={canEditWorkLog(log) ? "Edit your work log" : "You can only edit your own work logs"}
                        >
                          <Edit className="h-5 w-5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteWorkLog(log.id, log)}
                          disabled={deletingId === log.id || !canEditWorkLog(log)}
                          className={`${canEditWorkLog(log) ? "text-red-600 hover:text-red-700" : "text-gray-400 cursor-not-allowed"} h-9 w-9 sm:h-8 sm:w-8 p-0`}
                          title={canEditWorkLog(log) ? "Delete your work log" : "You can only delete your own work logs"}
                        >
                          <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {editingId === log.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-pink-700 mb-3">
                          Your Name
                        </label>
                        <Input
                          value={editData.your_name}
                          onChange={(e) => setEditData(prev => ({ ...prev, your_name: e.target.value }))}
                          className="border-pink-200 focus:ring-pink-400 focus:border-pink-400 h-12 sm:h-10 px-4 sm:px-3 text-base sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-pink-700 mb-3">
                          Description
                        </label>
                        <textarea
                          value={editData.description}
                          onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                          rows={4}
                          className="flex w-full rounded-md border border-pink-200 bg-white px-4 py-3 sm:px-3 sm:py-2 text-base sm:text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 resize-none"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                        <Button onClick={saveEditWorkLog} className="bg-pink-500 hover:bg-pink-600 h-12 sm:h-9 text-base sm:text-sm font-medium">
                          <Save className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={cancelEditWorkLog} variant="outline" className="h-12 sm:h-9 text-base sm:text-sm">
                          <X className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-black mb-4 text-base sm:text-sm leading-relaxed">{log.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-black">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="font-medium">{log.person}</span>
                            {canEditWorkLog(log) && (
                              <Badge variant="outline" className="ml-2 text-xs text-green-600 border-green-200">
                                Your log
                              </Badge>
                            )}
                          </div>
                          {log.attachment_path && (
                            <Badge variant="secondary" className="self-start sm:self-auto">
                              📎 Attachment
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}