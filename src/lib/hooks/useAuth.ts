import { useEffect, useState, useCallback } from 'react';
import { FirebaseAuth, type AuthSession, type AuthUser } from '@/lib/auth/firebase-auth';
import { isFirebaseConfigured } from '@/lib/config/firebase';
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
      
      // Check if Firebase is configured first
      const configured = await isFirebaseConfigured();
      if (!configured) {
        setError('Firebase not configured - please set up environment variables');
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      const { session: authSession, error: sessionError } = await FirebaseAuth.getSession();
      
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
      const { error: signOutError } = await FirebaseAuth.signOut();
      
      if (signOutError) {
        setError(signOutError);
      } else {
        setSession(null);
        setUser(null);
        // Force a full page reload to clear all cookies and redirect to home
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { error: refreshError } = await FirebaseAuth.refreshSession();
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
    const setupAuthListener = async () => {
      const unsubscribe = await FirebaseAuth.onAuthStateChange((authSession) => {
        setSession(authSession);
        setUser(authSession?.user || null);
        setLoading(false);
      });
      return unsubscribe;
    };

    let unsubscribe: (() => void) | null = null;
    setupAuthListener().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
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