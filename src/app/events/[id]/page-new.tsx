'use client'
// @ts-nocheck

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// @ts-ignore
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Users, Plus, ArrowLeft, Clock, CheckCircle, Edit, Trash2, Save, X } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useUserPermissions } from '@/hooks/use-config'
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

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({
    task_name: '',
    assigned_to: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed'
  })
  const [newIdea, setNewIdea] = useState({
    person_name: '',
    idea_text: ''
  })
  const [newWorkLog, setNewWorkLog] = useState({
    description: '',
    hours_spent: '',
    task_id: ''
  })
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddIdea, setShowAddIdea] = useState(false)
  const [showAddWorkLog, setShowAddWorkLog] = useState(false)
  const { hasPermission, role } = useUserPermissions()

  useEffect(() => {
    fetchEventData()
    fetchTeamMembers()
    fetchCurrentUser()
  }, [params.id])

  const fetchEventData = async () => {
    try {
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', params.id)
        .single()

      if (eventError) {
        console.error('Error fetching event:', eventError)
        toast({ title: 'Error', description: 'Failed to load event details', variant: 'destructive' })
        return
      }

      setEvent(eventData)

      // Fetch tasks with assignee names
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles!tasks_assigned_to_fkey(full_name)
        `)
        .eq('event_id', params.id)
        .order('created_at', { ascending: true })

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
      } else {
        const tasksWithNames = tasksData.map(task => ({
          ...task,
          assignee_name: (task.profiles as any)?.full_name || 'Unassigned'
        }))
        setTasks(tasksWithNames)
      }

      // Fetch ideas
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select('*')
        .eq('event_id', params.id)
        .order('created_at', { ascending: true })

      if (ideasError) {
        console.error('Error fetching ideas:', ideasError)
      } else {
        setIdeas(ideasData || [])
      }

      // Fetch work logs
      const { data: workLogsData, error: workLogsError } = await supabase
        .from('work_logs')
        .select(`
          *,
          tasks!work_logs_task_id_fkey(task_name)
        `)
        .eq('event_id', params.id)
        .order('created_at', { ascending: false })

      if (workLogsError) {
        console.error('Error fetching work logs:', workLogsError)
      } else if (workLogsData) {
        const workLogsWithTasks = workLogsData.map(log => ({
          ...log,
          task_name: (log.tasks as any)?.task_name || 'General'
        }))
        setWorkLogs(workLogsWithTasks)
      } else {
        setWorkLogs([])
      }
    } catch (error) {
      console.error('Error:', error)
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true })

      if (error) {
        console.error('Error fetching team members:', error)
      } else {
        setTeamMembers(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
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
        
        setCurrentUser(profile)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const createTask = async () => {
    if (!newTask.task_name.trim()) {
      toast({ title: 'Error', description: 'Task name is required', variant: 'destructive' })
      return
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          event_id: params.id,
          task_name: newTask.task_name,
          assigned_to: newTask.assigned_to || null,
          priority: newTask.priority,
          status: newTask.status,
          deadline: newTask.deadline || null
        }])
        .select()

      if (error) {
        console.error('Error creating task:', error)
        toast({ title: 'Error', description: 'Failed to create task', variant: 'destructive' })
      } else {
        toast({ title: 'Success', description: 'Task created successfully' })
        setNewTask({
          task_name: '',
          assigned_to: '',
          priority: 'medium',
          deadline: '',
          status: 'pending'
        })
        setShowAddTask(false)
        fetchEventData()
      }
    } catch (error) {
      console.error('Error:', error)
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' })
    }
  }

  const updateTaskStatus = async (taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId)

      if (error) {
        console.error('Error updating task:', error)
        toast({ title: 'Error', description: 'Failed to update task', variant: 'destructive' })
      } else {
        toast({ title: 'Success', description: 'Task updated successfully' })
        fetchEventData()
      }
    } catch (error) {
      console.error('Error:', error)
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' })
    }
  }

  const createIdea = async () => {
    if (!newIdea.person_name.trim() || !newIdea.idea_text.trim()) {
      toast({ title: 'Error', description: 'Both name and idea are required', variant: 'destructive' })
      return
    }

    try {
      const { error } = await supabase
        .from('ideas')
        .insert([{
          event_id: params.id,
          person_name: newIdea.person_name,
          idea_text: newIdea.idea_text
        }])

      if (error) {
        console.error('Error creating idea:', error)
        toast({ title: 'Error', description: 'Failed to add idea', variant: 'destructive' })
      } else {
        toast({ title: 'Success', description: 'Idea added successfully' })
        setNewIdea({ person_name: '', idea_text: '' })
        setShowAddIdea(false)
        fetchEventData()
      }
    } catch (error) {
      console.error('Error:', error)
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' })
    }
  }

  const createWorkLog = async () => {
    if (!newWorkLog.description.trim()) {
      toast({ title: 'Error', description: 'Work description is required', variant: 'destructive' })
      return
    }

    if (!currentUser) {
      toast({ title: 'Error', description: 'You must be logged in to add work logs', variant: 'destructive' })
      return
    }

    try {
      const { error } = await supabase
        .from('work_logs')
        .insert([{
          event_id: params.id,
          task_id: newWorkLog.task_id || null,
          person: currentUser?.full_name || currentUser?.email || 'Unknown User',
          description: newWorkLog.description,
          hours_spent: newWorkLog.hours_spent ? parseFloat(newWorkLog.hours_spent) : null
        }])

      if (error) {
        console.error('Error creating work log:', error)
        toast({ title: 'Error', description: 'Failed to add work log', variant: 'destructive' })
      } else {
        toast({ title: 'Success', description: 'Work log added successfully' })
        setNewWorkLog({ description: '', hours_spent: '', task_id: '' })
        setShowAddWorkLog(false)
        fetchEventData()
      }
    } catch (error) {
      console.error('Error:', error)
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' })
    }
  }

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-900">Event not found</h2>
        <Link href="/events">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
            <div className="flex items-center space-x-4 text-gray-600 mt-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <span>•</span>
              <span>{event.description}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="planning">Planning Board</TabsTrigger>
          <TabsTrigger value="logs">Work Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Task Assignment</CardTitle>
              {hasPermission('create_events') && (
                <Button size="sm" onClick={() => setShowAddTask(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {/* Add Task Form */}
              {showAddTask && (
                <Card className="mb-4">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="task_name">Task Name</Label>
                        <Input
                          id="task_name"
                          value={newTask.task_name}
                          onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
                          placeholder="Enter task name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="assigned_to">Assign To</Label>
                          <select
                            id="assigned_to"
                            value={newTask.assigned_to}
                            onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                          >
                            <option value="">Unassigned</option>
                            {teamMembers.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.full_name || member.email}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <select
                            id="priority"
                            value={newTask.priority}
                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="deadline">Deadline</Label>
                          <Input
                            id="deadline"
                            type="date"
                            value={newTask.deadline}
                            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <select
                            id="status"
                            value={newTask.status}
                            onChange={(e) => setNewTask({ ...newTask, status: e.target.value as 'pending' | 'in_progress' | 'completed' })}
                            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={createTask}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Task
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddTask(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tasks List */}
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">{task.task_name}</h3>
                        <Badge className={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                        <Badge className={statusColors[task.status]}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Assigned to: {task.assignee_name}</span>
                        {task.deadline && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {hasPermission('edit_own') && (
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tasks assigned yet.</p>
                    {hasPermission('create_events') && (
                      <Button className="mt-2" onClick={() => setShowAddTask(true)}>
                        Add First Task
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Planning Board</CardTitle>
              <Button size="sm" onClick={() => setShowAddIdea(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Idea
              </Button>
            </CardHeader>
            <CardContent>
              {/* Add Idea Form */}
              {showAddIdea && (
                <Card className="mb-4">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="person_name">Your Name</Label>
                        <Input
                          id="person_name"
                          value={newIdea.person_name}
                          onChange={(e) => setNewIdea({ ...newIdea, person_name: e.target.value })}
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="idea_text">Idea</Label>
                        <Input
                          id="idea_text"
                          value={newIdea.idea_text}
                          onChange={(e) => setNewIdea({ ...newIdea, idea_text: e.target.value })}
                          placeholder="Share your idea"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={createIdea}>
                          <Save className="h-4 w-4 mr-2" />
                          Add Idea
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddIdea(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ideas List */}
              <div className="space-y-4">
                {ideas.map((idea) => (
                  <div key={idea.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{idea.person_name}</h4>
                        <p className="text-gray-700 mt-1">{idea.idea_text}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(idea.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {ideas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No ideas shared yet.</p>
                    <Button className="mt-2" onClick={() => setShowAddIdea(true)}>
                      Share First Idea
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Work Logs</CardTitle>
              <Button size="sm" onClick={() => setShowAddWorkLog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Work Log
              </Button>
            </CardHeader>
            <CardContent>
              {/* Add Work Log Form */}
              {showAddWorkLog && (
                <Card className="mb-4">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        Logged in as: <span className="font-medium">{currentUser?.full_name || currentUser?.email || 'Unknown User'}</span>
                      </div>
                      <div>
                        <Label htmlFor="task_id">Related Task (Optional)</Label>
                        <select
                          id="task_id"
                          value={newWorkLog.task_id}
                          onChange={(e) => setNewWorkLog({ ...newWorkLog, task_id: e.target.value })}
                          className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="">General Work</option>
                          {tasks.map((task) => (
                            <option key={task.id} value={task.id}>
                              {task.task_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="description">Work Description</Label>
                        <textarea
                          id="description"
                          value={newWorkLog.description}
                          onChange={(e) => setNewWorkLog({ ...newWorkLog, description: e.target.value })}
                          placeholder="Describe what work you did"
                          className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="hours_spent">Hours Spent (Optional)</Label>
                        <Input
                          id="hours_spent"
                          type="number"
                          step="0.5"
                          value={newWorkLog.hours_spent}
                          onChange={(e) => setNewWorkLog({ ...newWorkLog, hours_spent: e.target.value })}
                          placeholder="e.g. 2.5"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={createWorkLog}>
                          <Save className="h-4 w-4 mr-2" />
                          Add Work Log
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddWorkLog(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Work Logs List - Only show when there are logs */}
              {workLogs.length > 0 && (
                <div className="space-y-4">
                  {workLogs.map((log) => (
                    <div key={log.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{log.person}</h4>
                            {log.task_name && (
                              <Badge variant="outline">{log.task_name}</Badge>
                            )}
                            {log.hours_spent && (
                              <span className="text-sm text-gray-600">
                                {log.hours_spent}h
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700">{log.description}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(log.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {workLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No work logs recorded yet.</p>
                  <Button className="mt-2" onClick={() => setShowAddWorkLog(true)}>
                    Add First Work Log
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}