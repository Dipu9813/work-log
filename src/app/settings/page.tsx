'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// @ts-ignore
import { Switch } from '@/components/ui/switch'
import { Settings, Save, User, Shield } from 'lucide-react'
import { useAppConfig, useUserPermissions } from '@/hooks/use-config'
import { toast } from '@/components/ui/use-toast'

export default function SettingsPage() {
  const { config, updateConfig } = useAppConfig()
  const { hasPermission, role } = useUserPermissions()
  const [localConfig, setLocalConfig] = useState(config)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  if (!hasPermission('manage_config')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access application settings.</p>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = [
        { key: 'app_name', value: localConfig.app_name },
        { key: 'app_description', value: localConfig.app_description },
        { key: 'welcome_message', value: localConfig.welcome_message },
        { key: 'show_setup_guide', value: localConfig.show_setup_guide.toString() },
        { key: 'enable_team_features', value: localConfig.enable_team_features.toString() },
        { key: 'default_user_role', value: localConfig.default_user_role },
        { key: 'company_logo_url', value: localConfig.company_logo_url || '' },
        { key: 'primary_color', value: localConfig.primary_color || '' }
      ]

      let success = true
      for (const update of updates) {
        const result = await updateConfig(update.key, update.value)
        if (!result) {
          success = false
          break
        }
      }

      if (success) {
        toast({
          title: 'Settings Saved',
          description: 'Application settings have been updated successfully.'
        })
      } else {
        toast({
          title: 'Save Failed',
          description: 'Failed to save some settings. Please try again.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while saving settings.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-pink-900">Application Settings</h1>
          <p className="text-pink-600">Manage your application configuration and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-pink-400" />
          <span className="text-sm text-pink-400 capitalize">{role} User</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="app_name">Application Name</Label>
              <Input
                id="app_name"
                value={localConfig.app_name}
                onChange={(e) => setLocalConfig({ ...localConfig, app_name: e.target.value })}
                placeholder="Enter application name"
              />
            </div>

            <div>
              <Label htmlFor="app_description">Application Description</Label>
              <Input
                id="app_description"
                value={localConfig.app_description}
                onChange={(e) => setLocalConfig({ ...localConfig, app_description: e.target.value })}
                placeholder="Brief description of your application"
              />
            </div>

            <div>
              <Label htmlFor="welcome_message">Welcome Message</Label>
              <Input
                id="welcome_message"
                value={localConfig.welcome_message}
                onChange={(e) => setLocalConfig({ ...localConfig, welcome_message: e.target.value })}
                placeholder="Message shown on dashboard"
              />
            </div>

            <div>
              <Label htmlFor="company_logo_url">Company Logo URL (Optional)</Label>
              <Input
                id="company_logo_url"
                value={localConfig.company_logo_url || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, company_logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <Label htmlFor="primary_color">Primary Color (Optional)</Label>
              <Input
                id="primary_color"
                value={localConfig.primary_color || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, primary_color: e.target.value })}
                placeholder="#3B82F6"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show_setup_guide" className="text-sm font-medium">
                  Show Setup Guide
                </Label>
                <p className="text-xs text-pink-400 mt-1">
                  Display setup guide link in dashboard
                </p>
              </div>
              <Switch
                id="show_setup_guide"
                checked={localConfig.show_setup_guide}
                onCheckedChange={(checked: boolean) => 
                  setLocalConfig({ ...localConfig, show_setup_guide: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable_team_features" className="text-sm font-medium">
                  Enable Team Features
                </Label>
                <p className="text-xs text-pink-400 mt-1">
                  Allow team management and collaboration features
                </p>
              </div>
              <Switch
                id="enable_team_features"
                checked={localConfig.enable_team_features}
                onCheckedChange={(checked: boolean) => 
                  setLocalConfig({ ...localConfig, enable_team_features: checked })
                }
              />
            </div>

            <div>
              <Label htmlFor="default_user_role">Default User Role</Label>
              <select
                id="default_user_role"
                value={localConfig.default_user_role}
                onChange={(e) => setLocalConfig({ 
                  ...localConfig, 
                  default_user_role: e.target.value as 'admin' | 'manager' | 'member' 
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Role assigned to new users by default
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}