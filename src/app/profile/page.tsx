"use client";

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-gray-500">You must be logged in to view your profile.</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="block text-gray-600 text-sm">Full Name</span>
            <span className="font-medium text-lg">{user.user_metadata?.full_name || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-gray-600 text-sm">Email</span>
            <span className="font-medium text-lg">{user.email}</span>
          </div>
          <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
