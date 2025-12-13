export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          name: string
          date: string
          description: string | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          date: string
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          date?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      tasks: {
        Row: {
          id: string
          event_id: string
          assigned_to: string | null
          task_name: string
          priority: 'low' | 'medium' | 'high'
          status: 'pending' | 'in_progress' | 'completed'
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          assigned_to?: string | null
          task_name: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in_progress' | 'completed'
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          assigned_to?: string | null
          task_name?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in_progress' | 'completed'
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          event_id: string
          person_name: string
          idea_text: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          person_name: string
          idea_text: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          person_name?: string
          idea_text?: string
          created_at?: string
        }
      }
      app_config: {
        Row: {
          id: string
          key: string
          value: string | null
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'manager' | 'member'
          permissions: string[]
          assigned_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'admin' | 'manager' | 'member'
          permissions?: string[]
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'manager' | 'member'
          permissions?: string[]
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      navigation_items: {
        Row: {
          id: string
          name: string
          href: string
          icon: string
          order_index: number
          is_active: boolean
          required_permission: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          href: string
          icon: string
          order_index?: number
          is_active?: boolean
          required_permission?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          href?: string
          icon?: string
          order_index?: number
          is_active?: boolean
          required_permission?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      work_logs: {
        Row: {
          id: string
          event_id: string
          task_id: string | null
          person: string
          description: string
          hours_spent: number | null
          attachment_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          task_id?: string | null
          person: string
          description: string
          hours_spent?: number | null
          attachment_path?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          task_id?: string | null
          person?: string
          description?: string
          hours_spent?: number | null
          attachment_path?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'member' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'member' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'member' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}