import { useEffect, useState, useCallback } from 'react';
import { SupabaseAuth, type AuthSession, type AuthUser } from '@/lib/auth/supabase-auth';
import { useRouter } from 'next/navigation';

interface UseAuthReturn {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { session: authSession, error: sessionError } = await SupabaseAuth.getSession();
      
      if (sessionError) {
        setError(sessionError);
        setSession(null);
        setUser(null);
      } else {
        setSession(authSession);
        setUser(authSession?.user || null);
      }
    } catch (err: any) {
      setError(err.message);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await SupabaseAuth.signOut();
      
      if (signOutError) {
        setError(signOutError);
      } else {
        setSession(null);
        setUser(null);
        router.push('/sign-in');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const refreshSession = useCallback(async () => {
    try {
      const { error: refreshError } = await SupabaseAuth.refreshSession();
      if (refreshError) {
        setError(refreshError);
      } else {
        await loadSession();
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [loadSession]);

  useEffect(() => {
    // Load initial session
    loadSession();

    // Listen for auth changes
    const { data: { subscription } } = SupabaseAuth.onAuthStateChange((authSession) => {
      setSession(authSession);
      setUser(authSession?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadSession]);

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!session && !!user,
    signOut,
    refreshSession,
  };
} 