'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Database, Key, Users } from 'lucide-react'
import Link from 'next/link'

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Work Logs Tracking App
          </h1>
          <p className="text-lg text-gray-600">
            Follow these steps to set up your Supabase backend and start tracking work logs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Step 1: Create Supabase Project */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>1. Create Supabase Project</CardTitle>
                  <CardDescription>Set up your database backend</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-4">
                <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a></li>
                <li>Sign up/Sign in and create a new project</li>
                <li>Choose a name and secure password</li>
                <li>Wait for the project to be provisioned</li>
              </ol>
              <Button onClick={() => window.open('https://supabase.com', '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Supabase
              </Button>
            </CardContent>
          </Card>

          {/* Step 2: Setup Database Schema */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>2. Setup Database Schema</CardTitle>
                  <CardDescription>Create tables and relationships</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-4">
                <li>In your Supabase dashboard, go to SQL Editor</li>
                <li>Copy the schema from <code className="bg-gray-100 px-2 py-1 rounded">supabase-schema.sql</code></li>
                <li>Paste and run the SQL to create all tables</li>
                <li>Verify tables are created in Table Editor</li>
              </ol>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-600">
                  The schema file is located in your project root and contains all necessary tables, RLS policies, and triggers.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Configure Environment */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Key className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle>3. Configure Environment</CardTitle>
                  <CardDescription>Add your Supabase credentials</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-4">
                <li>Go to Settings → API in your Supabase project</li>
                <li>Copy your Project URL and anon public key</li>
                <li>Update <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> with your credentials</li>
                <li>Restart your development server</li>
              </ol>
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Keep your service role key secure and never expose it in client-side code.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Create Your Account */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>4. Create Your Account</CardTitle>
                  <CardDescription>Start using the application</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-4">
                <li>Click "Sign Up" to create your first account</li>
                <li>Verify your email address</li>
                <li>Sign in and start creating events</li>
                <li>Invite team members to collaborate</li>
              </ol>
              <Link href="/auth/signup">
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            🚀 Ready to get started?
          </h2>
          <p className="text-blue-800 mb-4">
            Once you've completed the setup, you'll have access to all features including event management, task assignment, work log tracking, and team collaboration.
          </p>
          <div className="flex space-x-4">
            <Link href="/auth/login">
              <Button>
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline">
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Check the README.md file for detailed documentation.
          </p>
        </div>
      </div>
    </div>
  )
}