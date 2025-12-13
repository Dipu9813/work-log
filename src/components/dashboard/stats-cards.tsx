'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react'
import { useEvents, useWorkLogs } from '@/hooks/use-database'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

export function StatsCards() {
  const { events } = useEvents()
  const { workLogs } = useWorkLogs()
  const [taskStats, setTaskStats] = useState({ active: 0, completed: 0 })
  const [teamCount, setTeamCount] = useState(0)


  useEffect(() => {
    fetchTaskStats()
    fetchTeamCount()
  }, [])

  const fetchTaskStats = async () => {
    try {
      const { data: activeTasks } = await supabase
        .from('tasks')
        .select('id')
        .in('status', ['pending', 'in_progress'])

      const { data: completedTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('status', 'completed')

      setTaskStats({
        active: activeTasks?.length || 0,
        completed: completedTasks?.length || 0
      })
    } catch (error) {
      console.error('Error fetching task stats:', error)
    }
  }

  const fetchTeamCount = async () => {
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      setTeamCount(count || 0)
    } catch (error) {
      console.error('Error fetching team count:', error)
    }
  }

  const stats = [
    {
      title: 'Total Events',
      value: events.length.toString(),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Tasks',
      value: taskStats.active.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Completed Tasks',
      value: taskStats.completed.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Team Members',
      value: teamCount.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}