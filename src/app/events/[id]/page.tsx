'use client'
// @ts-nocheck

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// @ts-ignore
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Users, Plus, ArrowLeft, Clock, CheckCircle, Edit, Trash2, Save, X, User } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useUserPermissions } from '@/hooks/use-config'
import { useWorkLogs } from '@/hooks/use-database'
import { toast } from '@/components/ui/use-toast'

interface Task {
  id: string
  name: string
  assigned_to: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  deadline: string | null
  created_at: string
  assignee_name?: string
}

interface Idea {
  id: string
  person_name: string
  idea_text: string
  created_at: string
}

interface WorkLog {
  id: string
  person: string
  description: string
  hours_spent: number | null
  task_id: string | null
  created_at: string
  task_name?: string
}

interface Event {
  id: string
  name: string
  date: string
  description: string | null
  created_by: string
  created_at: string
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const [event, setEvent] = useState<Event | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { workLogs: allWorkLogs, createWorkLog: createWorkLogFromHook } = useWorkLogs()
  
  // Filter work logs to only show those for this event
  const workLogs = allWorkLogs.filter(log => log.event_id === resolvedParams.id)
  const [newTask, setNewTask] = useState({
    name: '',
    assigned_to: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed'
  })
  const [newIdea, setNewIdea] = useState({
    idea_text: ''
  })
  const [newWorkLog, setNewWorkLog] = useState({
    description: '',
    task_id: '',
    hours_spent: '',
    your_name: ''
  })
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddIdea, setShowAddIdea] = useState(false)
  const [showAddWorkLog, setShowAddWorkLog] = useState(false)
  const [editingWorkLogId, setEditingWorkLogId] = useState<string | null>(null)
  const [editWorkLogData, setEditWorkLogData] = useState({ description: '', your_name: '' })
  const [deletingWorkLogId, setDeletingWorkLogId] = useState<string | null>(null)
  const { hasPermission } = useUserPermissions()

  useEffect(() => {
    const loadData = async () => {
      await fetchEventData()
      await fetchCurrentUser()
      await fetchTeamMembers()
    }
    loadData()
  }, [resolvedParams.id])

  const fetchEventData = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (eventError) {
        console.error('Error fetching event:', eventError)
        setLoading(false)
        return
      }
      setEvent(eventData)

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('event_id', resolvedParams.id)

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
        setTasks([])
      } else if (tasksData) {
        // Fetch assignee names separately
        const tasksWithNames = await Promise.all(
          tasksData.map(async (task) => {
            if (task.assigned_to) {
              try {
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('full_name')
                  .eq('id', task.assigned_to)
                  .single()
                
                if (profileError) {
                  console.warn('Error fetching profile for task:', profileError)
                }
                
                return {
                  ...task,
                  assignee_name: profile?.full_name || 'Unknown User'
                }
              } catch (error) {
                console.warn('Error fetching assignee name:', error)
                return {
                  ...task,
                  assignee_name: 'Unknown User'
                }
              }
            }
            return {
              ...task,
              assignee_name: 'Unassigned'
            }
          })
        )
        setTasks(tasksWithNames)
      } else {
        setTasks([])
      }

      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select('*')
        .eq('event_id', resolvedParams.id)
      
      if (ideasError) {
        console.error('Error fetching ideas:', ideasError)
      } else {
        setIdeas(ideasData || [])
      }

      // Work logs are now handled by the useWorkLogs hook
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      console.log('🔍 Fetching team members from profiles table...')
      
      // First, let's try the normal query
      let { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true })

      console.log('📊 Profiles query result:', { data, error, count: data?.length })

      // If we got fewer than expected, try to bypass RLS by using a different approach
      if (data && data.length < 5) {
        console.log('🔄 Trying alternative query to get all profiles...')
        
        // Try with explicit RLS bypass (if available)
        let allData, allError
        try {
          const rpcResult = await supabase.rpc('get_all_profiles')
          allData = rpcResult.data
          allError = rpcResult.error
        } catch {
          // If RPC doesn't exist, try a different select approach
          const fallbackResult = await supabase
            .from('profiles')
            .select('id, full_name, email')
          allData = fallbackResult.data
          allError = fallbackResult.error
        }

        if (allData && allData.length > (data?.length || 0)) {
          console.log('✅ Alternative query found more profiles:', allData.length)
          data = allData
          error = allError
        }
      }

      if (error) {
        console.error('❌ RLS or permission error:', error)
        toast({
          title: 'Permission Issue', 
          description: `Only showing ${data?.length || 0} of 5 team members. Check Row Level Security policies in Supabase.`,
          variant: 'destructive'
        })
      }

      console.log(`✅ Final result: ${data?.length || 0} profiles available`)
      setTeamMembers(data || [])
      
    } catch (error) {
      console.error('💥 Exception:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading team members',
        variant: 'destructive'
      })
    }
  }

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
        setNewWorkLog(prev => ({ ...prev, your_name: userName }))
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const createTask = async () => {
    if (!newTask.name.trim()) return

    const { error } = await supabase.from('tasks').insert([{
      event_id: resolvedParams.id,
      name: newTask.name,
      assigned_to: newTask.assigned_to || null,
      priority: newTask.priority,
      status: newTask.status,
      deadline: newTask.deadline || null
    }])

    if (error) {
      console.error('Error creating task:', error)
      return
    }

    setNewTask({ name: '', assigned_to: '', priority: 'medium', deadline: '', status: 'pending' })
    setShowAddTask(false)
    fetchEventData()
  }

  const updateTaskStatus = async (taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
    await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)
    fetchEventData()
  }

  const createIdea = async () => {
    if (!newIdea.idea_text.trim() || !currentUser) return

    const { error } = await supabase.from('ideas').insert([{
      event_id: resolvedParams.id,
      person_name: currentUser?.full_name || currentUser?.email || 'Unknown User',
      idea_text: newIdea.idea_text
    }])

    if (error) {
      console.error('Error creating idea:', error)
      return
    }

    setNewIdea({ idea_text: '' })
    setShowAddIdea(false)
    fetchEventData()
  }

  const createWorkLog = async () => {
    if (!newWorkLog.description.trim() || !currentUser) {
      toast({
        title: 'Error',
        description: 'Please enter a work description and make sure you\'re logged in.',
        variant: 'destructive',
      })
      return
    }

    try {
      const workLogData = {
        event_id: resolvedParams.id,
        task_id: newWorkLog.task_id || undefined,
        description: newWorkLog.description.trim(),
        hours_spent: newWorkLog.hours_spent ? parseFloat(newWorkLog.hours_spent) : undefined,
        person: newWorkLog.your_name.trim() || currentUser?.full_name || currentUser?.email || 'Unknown User'
      }

      const result = await createWorkLogFromHook(workLogData)
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Work log added successfully!',
        })
        setNewWorkLog({ description: '', hours_spent: '', task_id: '', your_name: currentUser?.full_name || currentUser?.email || '' })
        setShowAddWorkLog(false)
        // No need to call fetchEventData() as useWorkLogs handles the refresh
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add work log. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating work log:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while adding the work log.',
        variant: 'destructive',
      })
    }
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
    
    setEditingWorkLogId(log.id)
    setEditWorkLogData({
      your_name: log.name || log.person || '',
      description: log.description || ''
    })
  }

  const saveEditWorkLog = async () => {
    if (!editingWorkLogId) return

    try {
      const { error } = await supabase
        .from('work_logs')
        .update({
          name: editWorkLogData.your_name.trim(),
          description: editWorkLogData.description.trim()
        })
        .eq('id', editingWorkLogId)

      if (error) {
        throw error
      }

      toast({
        title: 'Success',
        description: 'Work log updated successfully',
      })

      setEditingWorkLogId(null)
      setEditWorkLogData({ your_name: '', description: '' })
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
    setEditingWorkLogId(null)
    setEditWorkLogData({ your_name: '', description: '' })
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

    setDeletingWorkLogId(logId)
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
    } catch (error) {
      console.error('Error deleting work log:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete work log',
        variant: 'destructive',
      })
    } finally {
      setDeletingWorkLogId(null)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }

  if (!event) {
    return <div className="text-center py-8">
      <h2 className="text-2xl font-semibold">Event not found</h2>
      <Link href="/events"><Button className="mt-4">Back to Events</Button></Link>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/events">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-pink-600 drop-shadow-sm">{event.name}</h1>
          <div className="flex items-center space-x-4 text-gray-600 mt-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
            <span>•</span>
            <span>{event.description}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="planning">Planning Board</TabsTrigger>
          <TabsTrigger value="logs">Work Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Task Assignment</CardTitle>
              <Button size="sm" onClick={() => setShowAddTask(true)}>
                <Plus className="h-4 w-4 mr-2" />Add Task
              </Button>
            </CardHeader>
            <CardContent>
              {showAddTask && (
                <Card className="mb-4">
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Task Name
                      </label>
                      <Input
                        value={newTask.name}
                        onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                        placeholder="Enter task name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign To
                      </label>
                      <select
                        value={newTask.assigned_to}
                        onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select team member...</option>
                        {teamMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.full_name || member.email}
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-gray-500 mt-1">
                        {teamMembers.length === 0 ? (
                          <p>No team members found. Create user accounts to assign tasks to others.</p>
                        ) : teamMembers.length === 1 ? (
                          <p>Only you are available. Have other team members sign up to assign tasks to them.</p>
                        ) : (
                          <p>{teamMembers.length} team members available for assignment.</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={createTask}>Save</Button>
                      <Button variant="outline" onClick={() => setShowAddTask(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{task.name}</h3>
                      <p className="text-sm text-gray-600">Assigned to: {task.assignee_name}</p>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tasks yet. Click "Add Task" to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Planning Board</CardTitle>
              <Button size="sm" onClick={() => setShowAddIdea(true)}>
                <Plus className="h-4 w-4 mr-2" />Add Idea
              </Button>
            </CardHeader>
            <CardContent>
              {showAddIdea && (
                <Card className="mb-4">
                  <CardContent className="pt-4 space-y-4">

                    <Input
                      value={newIdea.idea_text}
                      onChange={(e) => setNewIdea({ ...newIdea, idea_text: e.target.value })}
                      placeholder="Your idea"
                    />
                    <div className="flex space-x-2">
                      <Button onClick={createIdea}>Save</Button>
                      <Button variant="outline" onClick={() => setShowAddIdea(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="space-y-4">
                {ideas.map((idea) => (
                  <div key={idea.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium">{idea.person_name}</h4>
                    <p className="text-gray-700 mt-1">{idea.idea_text}</p>
                  </div>
                ))}
                {ideas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No ideas yet. Share your first idea!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Work Logs</CardTitle>
              <Button size="sm" onClick={() => setShowAddWorkLog(true)}>
                <Plus className="h-4 w-4 mr-2" />Add Work Log
              </Button>
            </CardHeader>
            <CardContent>
              {showAddWorkLog && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Add Work Log</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Your Name field */}
                    <div>
                      <label htmlFor="your_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <Input
                        id="your_name"
                        type="text"
                        required
                        value={newWorkLog.your_name}
                        onChange={(e) => setNewWorkLog({ ...newWorkLog, your_name: e.target.value })}
                        placeholder="Enter your name"
                        className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>





                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Work Description
                      </label>
                      <textarea
                        id="description"
                        value={newWorkLog.description}
                        onChange={(e) => setNewWorkLog({ ...newWorkLog, description: e.target.value })}
                        placeholder="Describe what work you completed..."
                        className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        rows={4}
                        required
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button onClick={createWorkLog} disabled={!newWorkLog.description.trim()}>
                        <Save className="h-4 w-4 mr-2" />
                        Add Work Log
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddWorkLog(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              {workLogs.length > 0 ? (
                <div className="space-y-4">
                  {workLogs.map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-600" />
                          <h4 className="font-medium">{log.person}</h4>
                          {canEditWorkLog(log) && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                              Your log
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditWorkLog(log)}
                              disabled={!canEditWorkLog(log)}
                              className={canEditWorkLog(log) ? "text-blue-600 hover:text-blue-700" : "text-gray-400 cursor-not-allowed"}
                              title={canEditWorkLog(log) ? "Edit your work log" : "You can only edit your own work logs"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteWorkLog(log.id, log)}
                              disabled={deletingWorkLogId === log.id || !canEditWorkLog(log)}
                              className={canEditWorkLog(log) ? "text-red-600 hover:text-red-700" : "text-gray-400 cursor-not-allowed"}
                              title={canEditWorkLog(log) ? "Delete your work log" : "You can only delete your own work logs"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {editingWorkLogId === log.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your Name
                            </label>
                            <Input
                              value={editWorkLogData.your_name}
                              onChange={(e) => setEditWorkLogData(prev => ({ ...prev, your_name: e.target.value }))}
                              className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <textarea
                              value={editWorkLogData.description}
                              onChange={(e) => setEditWorkLogData(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button onClick={saveEditWorkLog} size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button onClick={cancelEditWorkLog} variant="outline" size="sm">
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-700">{log.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No work logs yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}