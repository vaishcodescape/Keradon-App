'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { FirebaseAuth, type AuthSession, type AuthUser } from '@/lib/auth/firebase-auth';
import { isFirebaseConfigured } from '@/lib/config/firebase';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Firebase is configured first
      const configured = await isFirebaseConfigured();
      if (!configured) {
        console.warn('Firebase not configured - please set up environment variables');
        setError('Firebase not configured - please set up environment variables');
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      const { session: authSession, error: sessionError } = await FirebaseAuth.getSession();
      
      if (sessionError) {
        console.error('Session loading error:', sessionError);
        setError(sessionError);
        setSession(null);
        setUser(null);
      } else {
        setSession(authSession);
        setUser(authSession?.user || null);
        console.log('Session loaded:', authSession?.user?.email || 'No user');
      }
    } catch (err: any) {
      console.error('Session loading exception:', err);
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
      const unsubscribe = await FirebaseAuth.onAuthStateChange((authSession: AuthSession | null) => {
        console.log('Session provider received auth change:', authSession?.user?.email || 'No user');
        setSession(authSession);
        setUser(authSession?.user || null);
        setLoading(false);
        setError(null);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// For backward compatibility, keep the SessionProvider name
export const SessionProvider = AuthProvider; 