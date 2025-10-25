"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';
import { Spinner } from '@/components/ui/spinner';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && pathname === '/') {
      if (user) {
        // Only redirect to dashboard if we're on the root path
        router.push('/dashboard');
      } else {
        // Redirect to sign-in if not authenticated
        router.push('/sign-in');
      }
    }
  }, [router, user, loading, pathname]);

  // Only show loading on root path
  if (pathname === '/') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    );
  }

  return null;
}