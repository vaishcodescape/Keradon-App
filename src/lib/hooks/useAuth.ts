import { useEffect, useState, useCallback } from 'react';
import { FirebaseAuth, type AuthSession, type AuthUser } from '@/lib/auth/firebase-auth';
import { isFirebaseConfigured, getFirebaseAuth } from '@/lib/config/firebase';
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
      
      // Only run Firebase operations in browser environment
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      // Check if Firebase is configured first
      const configured = await isFirebaseConfigured();
      if (!configured) {
        setError('Firebase not configured - please set up environment variables');
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Use Firebase's native session management
      const firebaseUser = await FirebaseAuth.getCurrentFirebaseUser();
      
      if (firebaseUser) {
        
        // Get user data from Firestore
        const { session: authSession, error: sessionError } = await FirebaseAuth.getSession();
        
        if (sessionError) {
          setError(sessionError);
          setSession(null);
          setUser(null);
        } else {
          setSession(authSession);
          setUser(authSession?.user || null);
        }
      } else {
        setSession(null);
        setUser(null);
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

    // Listen for Firebase auth state changes
    const setupAuthListener = async () => {
      try {
        // Only set up auth listener in browser environment
        if (typeof window === 'undefined') {
          return () => {};
        }
        
        const auth = await getFirebaseAuth();
        
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            // User signed in
            
            // Get user data from Firestore
            const { session: authSession, error: sessionError } = await FirebaseAuth.getSession();
            
            if (sessionError) {
              setError(sessionError);
              setSession(null);
              setUser(null);
            } else {
              setSession(authSession);
              setUser(authSession?.user || null);
            }
          } else {
            // User signed out
            setSession(null);
            setUser(null);
            setError(null);
          }
          
          setLoading(false);
        });
        
        return unsubscribe;
      } catch (error) {
        return () => {};
      }
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