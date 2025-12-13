'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

export function useEvents() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchEvents()
  }, [user])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching events:', error)
      } else {
        setEvents(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (eventData: {
    name: string
    date: string
    description?: string
  }) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: user.id
        } as any)
        .select()
        .single()

      if (error) {
        console.error('Error creating event:', error)
        return null
      }

      await fetchEvents()
      return data
    } catch (error) {
      console.error('Error:', error)
      return null
    }
  }

  return {
    events,
    loading,
    createEvent,
    refetch: fetchEvents
  }
}


export function useWorkLogs() {
  const [workLogs, setWorkLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchWorkLogs()
  }, [user])

  const fetchWorkLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching work logs:', error)
        setWorkLogs([])
      } else if (data) {
        // Fetch related data separately to avoid foreign key issues
        const enrichedLogs = await Promise.all(
          data.map(async (log) => {
            const enrichedLog = { ...log }
            
            // Use the name column directly - much simpler!
            enrichedLog.person = log.name || 'Unknown User'
            
            // Fetch event name
            if (log.event_id) {
              try {
                const { data: event, error: eventError } = await supabase
                  .from('events')
                  .select('name')
                  .eq('id', log.event_id)
                  .single()
                
                if (eventError) {
                  console.warn('Error fetching event for work log:', eventError)
                }
                
                enrichedLog.event_name = event?.name || 'Unknown Event'
              } catch (error) {
                console.warn('Error fetching event name:', error)
                enrichedLog.event_name = 'Unknown Event'
              }
            } else {
              enrichedLog.event_name = 'General'
            }
            
            // Fetch task name
            if (log.task_id) {
              try {
                const { data: task, error: taskError } = await supabase
                  .from('tasks')
                  .select('name')
                  .eq('id', log.task_id)
                  .single()
                
                if (taskError) {
                  console.warn('Error fetching task for work log:', taskError)
                }
                
                enrichedLog.task_name = task?.name || 'Unknown Task'
              } catch (error) {
                console.warn('Error fetching task name:', error)
                enrichedLog.task_name = 'Unknown Task'
              }
            } else {
              enrichedLog.task_name = 'General'
            }
            
            return enrichedLog
          })
        )
        setWorkLogs(enrichedLogs)
      } else {
        setWorkLogs([])
      }
    } catch (error) {
      console.error('Error fetching work logs:', error)
      setWorkLogs([])
    } finally {
      setLoading(false)
    }
  }

  const createWorkLog = async (workLogData: {
    event_id: string
    task_id?: string
    person: string
    description: string
  }) => {
    try {
      console.log('🔄 Creating work log with data:', workLogData)
      
      // Validate required fields
      if (!workLogData.event_id || !workLogData.description || !workLogData.person) {
        const missingFields = []
        if (!workLogData.event_id) missingFields.push('event_id')
        if (!workLogData.description) missingFields.push('description')  
        if (!workLogData.person) missingFields.push('person')
        
        console.error('❌ Missing required fields:', missingFields)
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      // Verify user is authenticated (required for RLS policy)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('❌ Error getting user:', userError)
        throw new Error('Failed to get authenticated user')
      }
      
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      console.log('✅ User authenticated:', user.email)

      // Store both person_id (for relationships) and name (for display from "Your name" field)
      const workLogEntry = {
        event_id: workLogData.event_id,
        task_id: workLogData.task_id || null,
        person_id: user.id, // Use authenticated user's ID for RLS and relationships
        name: workLogData.person, // Store the actual name from "Your name" field in the name column
        description: workLogData.description
      }

      console.log('📝 Inserting work log with correct schema (person_id):', workLogEntry)

      const { data, error } = await supabase
        .from('work_logs')
        .insert(workLogEntry)
        .select()
        .single()

      if (error) {
        console.error('❌ Work log creation failed:', error)
        throw new Error(`Unable to insert work log. ${error.message}`)
      }

      console.log('✅ Work log created successfully:', data)
      await fetchWorkLogs()
      return data
    } catch (error) {
      console.error('💥 Exception creating work log:', error)
      // Re-throw the error so the calling code can handle it
      throw error
    }
  }

  return {
    workLogs,
    loading,
    createWorkLog,
    refetch: fetchWorkLogs
  }
}

export function useTasks(eventId?: string) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (eventId) {
      fetchTasks()
    }
  }, [eventId])

  const fetchTasks = async () => {
    if (!eventId) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles (full_name, email)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tasks:', error)
      } else {
        setTasks(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: {
    event_id: string
    name: string
    assigned_to?: string
    priority?: 'low' | 'medium' | 'high'
    deadline?: string
  }) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData as any)
        .select()
        .single()

      if (error) {
        console.error('Error creating task:', error)
        return null
      }

      await fetchTasks()
      return data
    } catch (error) {
      console.error('Error:', error)
      return null
    }
  }

  return {
    tasks,
    loading,
    createTask,
    refetch: fetchTasks
  }
}