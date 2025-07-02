'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { SupabaseAuth, type AuthSession, type AuthUser } from '@/lib/auth/supabase-auth';

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

  const loadSession = async () => {
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
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await SupabaseAuth.signOut();
      
      if (signOutError) {
        setError(signOutError);
      } else {
        setSession(null);
        setUser(null);
        // Force a full page reload to clear all cookies and redirect to sign-in
        window.location.href = '/sign-in';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
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
  };

  useEffect(() => {
    // Load initial session
    loadSession();

    // Listen for auth changes
    const { data: { subscription } } = SupabaseAuth.onAuthStateChange((authSession) => {
      setSession(authSession);
      setUser(authSession?.user || null);
      if (loading) {
        setLoading(false);
      }
      setError(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loading]);

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