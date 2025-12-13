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
  task_name: string
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
    task_id: ''
  })
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddIdea, setShowAddIdea] = useState(false)
  const [showAddWorkLog, setShowAddWorkLog] = useState(false)
  const { hasPermission } = useUserPermissions()

  useEffect(() => {
    fetchEventData()
    fetchTeamMembers()
    fetchCurrentUser()
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
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
    setTeamMembers(data || [])
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
        setCurrentUser(profile)
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
        person: currentUser?.full_name || currentUser?.email || 'Unknown User'
      }

      const result = await createWorkLogFromHook(workLogData)
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Work log added successfully!',
        })
        setNewWorkLog({ description: '', hours_spent: '', task_id: '' })
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
                    <Input
                      value={newTask.name}
                      onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                      placeholder="Task name"
                    />
                    <select
                      value={newTask.assigned_to}
                      onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.full_name || member.email}
                        </option>
                      ))}
                    </select>
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
                    {/* User info display */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        <User className="h-4 w-4 inline mr-2" />
                        Submitting as: <strong>{currentUser?.full_name || currentUser?.email || 'Loading...'}</strong>
                      </p>
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
                      <h4 className="font-medium">{log.person}</h4>
                      <p className="text-gray-700">{log.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(log.created_at).toLocaleDateString()}
                      </p>
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