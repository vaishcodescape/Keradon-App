"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';

export default function Home() {
  const router = useRouter();
  const { session, loading } = useSession();

  useEffect(() => {
    if (!loading) {
      if (session?.user) {
        // If user is authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        // If not authenticated, redirect to sign-in
        router.push('/sign-in');
      }
    }
  }, [router, session, loading]);

  return null;
}