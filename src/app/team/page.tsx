'use client'
// @ts-nocheck

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Mail, Plus, Users, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUserPermissions } from '@/hooks/use-config'
import { toast } from '@/components/ui/use-toast'

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'member' | 'viewer'
  avatar_url: string | null
  created_at: string
  tasksAssigned?: number
  tasksCompleted?: number
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const { hasPermission, role } = useUserPermissions()

  useEffect(() => {
    if (hasPermission('view_team')) {
      fetchTeamMembers()
    } else {
      setLoading(false)
    }
  }, [hasPermission])

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching team members:', error)
        toast({
          title: 'Error',
          description: 'Failed to load team members',
          variant: 'destructive'
        })
      } else if (data) {
        // Fetch task stats for each member
        const membersWithStats = await Promise.all(
          data.map(async (member: any) => {
            const [assignedTasks, completedTasks] = await Promise.all([
              supabase
                .from('tasks')
                .select('id', { count: 'exact', head: true })
                .eq('assigned_to', member.id),
              supabase
                .from('tasks')
                .select('id', { count: 'exact', head: true })
                .eq('assigned_to', member.id)
                .eq('status', 'completed')
            ])

            return {
              ...member,
              tasksAssigned: assignedTasks.count || 0,
              tasksCompleted: completedTasks.count || 0
            }
          })
        )

        setTeamMembers(membersWithStats)
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    if (!hasPermission('manage_users')) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to update member roles',
        variant: 'destructive'
      })
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) {
        console.error('Error updating role:', error)
        toast({
          title: 'Error',
          description: 'Failed to update member role',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Success',
          description: 'Member role updated successfully'
        })
        fetchTeamMembers() // Refresh the list
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    }
  }

  if (!hasPermission('view_team')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-12 w-12 text-pink-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-pink-900 mb-2">Access Denied</h2>
          <p className="text-pink-600">You don't have permission to view the team page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }

  const getRoleBadgeColor = (memberRole: string) => {
    switch (memberRole) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'member':
        return 'bg-pink-100 text-pink-800'
      case 'viewer':
        return 'bg-pink-50 text-pink-700'
      default:
        return 'bg-pink-50 text-pink-700'
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getCompletionRate = (completed: number, assigned: number) => {
    if (assigned === 0) return 0
    return Math.round((completed / assigned) * 100)
  }

  const adminCount = teamMembers.filter(m => m.role === 'admin').length
  const memberCount = teamMembers.filter(m => m.role === 'member').length
  const viewerCount = teamMembers.filter(m => m.role === 'viewer').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-pink-900">Team Management</h1>
          <p className="text-pink-600">Manage team members and their roles</p>
        </div>
        {hasPermission('manage_users') && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-pink-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-pink-600">Total Members</p>
                <p className="text-2xl font-bold text-pink-900">{teamMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-pink-600">Admins</p>
                <p className="text-2xl font-bold text-pink-900">{adminCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-pink-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-pink-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-pink-600">Members</p>
                <p className="text-2xl font-bold text-pink-900">{memberCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-pink-50 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-pink-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-pink-600">Viewers</p>
                <p className="text-2xl font-bold text-pink-900">{viewerCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center">
                    {member.avatar_url ? (
                      <img 
                        src={member.avatar_url} 
                        alt={member.full_name || 'User'} 
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-pink-600">
                        {getInitials(member.full_name)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-pink-900">
                      {member.full_name || 'Unnamed User'}
                    </h3>
                    <div className="flex items-center text-pink-400 mb-2">
                      <Mail className="h-4 w-4 mr-1" />
                      <span className="text-sm">{member.email}</span>
                    </div>
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {member.role}
                    </Badge>
                  </div>
                </div>
                
                {hasPermission('manage_users') && member.role !== 'admin' && (
                  <div className="flex space-x-2">
                    <select
                      value={member.role}
                      onChange={(e) => updateMemberRole(member.id, e.target.value as 'admin' | 'member' | 'viewer')}
                      className="text-sm border border-pink-200 rounded px-2 py-1"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-pink-50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-pink-400">Tasks Assigned:</span>
                    <span className="ml-2 font-semibold">{member.tasksAssigned || 0}</span>
                  </div>
                  <div>
                    <span className="text-pink-400">Tasks Completed:</span>
                    <span className="ml-2 font-semibold">{member.tasksCompleted || 0}</span>
                  </div>
                  <div>
                    <span className="text-pink-400">Completion Rate:</span>
                    <span className="ml-2 font-semibold">
                      {getCompletionRate(member.tasksCompleted || 0, member.tasksAssigned || 0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-pink-400">Joined:</span>
                    <span className="ml-2 font-semibold">
                      {new Date(member.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-pink-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-pink-900 mb-2">No team members found</h2>
          <p className="text-pink-600 mb-4">Get started by inviting your first team member.</p>
          {hasPermission('manage_users') && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          )}
        </div>
      )}
    </div>
  )
}