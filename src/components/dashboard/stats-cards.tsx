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
      color: 'text-[#D91A7A]',
      bgColor: 'bg-gradient-to-br from-pink-100 to-pink-50',
      borderColor: 'border-l-4 border-[#D91A7A]'
    },
    {
      title: 'Active Tasks',
      value: taskStats.active.toString(),
      icon: Clock,
      color: 'text-[#F26522]',
      bgColor: 'bg-gradient-to-br from-orange-100 to-orange-50',
      borderColor: 'border-l-4 border-[#F26522]'
    },
    {
      title: 'Completed Tasks',
      value: taskStats.completed.toString(),
      icon: CheckCircle,
      color: 'text-[#56C02B]',
      bgColor: 'bg-gradient-to-br from-green-100 to-green-50',
      borderColor: 'border-l-4 border-[#56C02B]'
    },
    {
      title: 'Team Members',
      value: teamCount.toString(),
      icon: Users,
      color: 'text-[#00BFE8]',
      bgColor: 'bg-gradient-to-br from-cyan-100 to-cyan-50',
      borderColor: 'border-l-4 border-[#00BFE8]'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className={`${stat.borderColor} ${stat.bgColor} shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 leading-tight">
                {stat.title}
              </CardTitle>
              <div className={`p-2.5 sm:p-2 rounded-xl bg-white shadow-sm`}>
                <Icon className={`h-5 w-5 sm:h-4 sm:w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}