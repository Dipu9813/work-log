"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

export function MobileProfileAvatar() {
  const { user } = useAuth();
  const initials = (user?.user_metadata?.full_name || user?.email || '?')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Support inline rendering for horizontal alignment
  return (
    <div className="sm:hidden flex justify-end">
      <Link href="/profile">
        <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-lg border border-pink-200 shadow hover:bg-pink-200 transition">
          {initials}
        </div>
      </Link>
    </div>
  );
}
