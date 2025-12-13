'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, User, FileText } from 'lucide-react'
import { useWorkLogs } from '@/hooks/use-database'
import { formatDistanceToNow } from 'date-fns'

export function RecentActivity() {
  const { workLogs, loading } = useWorkLogs()

  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const recentActivities = workLogs.slice(0, 6).map(log => ({
    id: log.id,
    type: 'work_log',
    user: log.person,
    action: `submitted work log: ${log.description.slice(0, 40)}${log.description.length > 40 ? '...' : ''}`,
    time: getTimeAgo(log.created_at),
    icon: FileText,
    color: 'text-blue-600'
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-base sm:text-sm text-gray-500">No recent activity</p>
            </div>
          ) : (
            recentActivities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className={`p-2 sm:p-2 rounded-full bg-gray-100 flex-shrink-0`}>
                    <Icon className={`h-5 w-5 sm:h-4 sm:w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base sm:text-sm font-medium text-gray-900 mb-1">
                      {activity.user}
                    </p>
                    <p className="text-sm sm:text-xs text-gray-500 leading-relaxed">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 sm:hidden">
                      {activity.time}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 hidden sm:block flex-shrink-0">
                    {activity.time}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}