'use client';

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const router = useRouter();

  useEffect(() => {
    // Set up session refresh interval
    const refreshInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) {
          // Session expired, redirect to sign in
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('Session refresh error:', error);
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [router]);

  return (
    <NextAuthSessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </NextAuthSessionProvider>
  );
} 