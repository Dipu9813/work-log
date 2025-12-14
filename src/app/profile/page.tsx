"use client";


import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showSignOutAnim, setShowSignOutAnim] = useState(false);

  // Simple mobile detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-gray-500">You must be logged in to view your profile.</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    if (isMobile) {
      setShowSignOutAnim(true);
      setTimeout(async () => {
        setShowSignOutAnim(false);
        await signOut();
        router.push('/auth/login');
      }, 1500); // Adjust duration to match GIF loop
    } else {
      await signOut();
      router.push('/auth/login');
    }
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
          {showSignOutAnim && isMobile ? (
            <div className="flex flex-col items-center justify-center">
              <img
                src="/Animation_-_1700989645104_20251214093310.gif"
                alt="Sign Out Animation"
                className="w-32 h-32 mb-2"
                style={{ margin: '0 auto' }}
              />
              <span className="text-gray-500 mt-2">Signing out...</span>
            </div>
          ) : (
            <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
