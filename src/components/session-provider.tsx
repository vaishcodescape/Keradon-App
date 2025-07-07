'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { FirebaseAuth, type AuthSession, type AuthUser } from '@/lib/auth/firebase-auth';
import { isFirebaseConfigured, getFirebaseAuth } from '@/lib/config/firebase';

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
      
      // Use Firebase's native session management
      const firebaseUser = await FirebaseAuth.getCurrentFirebaseUser();
      
      if (firebaseUser) {
        console.log('Firebase user found:', firebaseUser.email);
        
        // Get user data from Firestore
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
      } else {
        console.log('No Firebase user found');
        setSession(null);
        setUser(null);
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

    // Listen for Firebase auth state changes
    const setupAuthListener = async () => {
      try {
        console.log('Setting up Firebase auth state change listener...');
        const auth = await getFirebaseAuth();
        
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          console.log('Firebase auth state changed:', firebaseUser?.email || 'No user');
          console.log('Current pathname:', typeof window !== 'undefined' ? window.location.pathname : 'server');
          
          if (firebaseUser) {
            // User signed in
            console.log('User signed in:', firebaseUser.email);
            
            // Get user data from Firestore
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
            
            // If we have a session, try to redirect to dashboard if we're on callback page
            if (authSession?.user && typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
              const redirectTo = sessionStorage.getItem('authRedirectTo') || '/dashboard';
              console.log('Session provider forcing redirect to:', redirectTo);
              window.location.href = redirectTo;
            }
          } else {
            // User signed out
            console.log('User signed out');
            setSession(null);
            setUser(null);
            setError(null);
          }
          
          setLoading(false);
        });
        
        console.log('Firebase auth state change listener set up successfully');
        return unsubscribe;
      } catch (error) {
        console.error('Error setting up Firebase auth listener:', error);
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