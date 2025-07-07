'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, Unsubscribe } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/config/firebase';
import { FirebaseAuth } from '@/lib/auth/firebase-auth';

interface AuthContextType {
  user: any | null;
  loading: boolean;
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
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Only run Firebase operations in browser environment
        if (typeof window === 'undefined') {
          setLoading(false);
          setInitialized(true);
          return;
        }

    

        // First, check if Firebase is configured
        try {
          const configResponse = await fetch('/api/firebase-config');
          const config = await configResponse.json();
          
          if (!config.configured) {
            console.error('Firebase not configured:', config.message);
            setLoading(false);
            setInitialized(true);
            return;
          }
          
  
        } catch (configError) {
          console.error('Error checking Firebase config:', configError);
          setLoading(false);
          setInitialized(true);
          return;
        }

        // Reduced delay for faster loading
        await new Promise(resolve => setTimeout(resolve, 50));

        // Get Firebase auth instance
        const auth = await getFirebaseAuth();

        
        // Check if there's already a current user
        const currentUser = auth.currentUser;

        
        // If we're on the auth callback page, handle the redirect result first
        if (pathname === '/auth/callback') {
  
          const { data: redirectResult, error: redirectError } = await FirebaseAuth.handleRedirectResult();
          
          if (redirectError) {
            console.error('Redirect result error:', redirectError);
            // Don't redirect on error, let the callback page handle it
            setLoading(false);
            setInitialized(true);
            return;
          }
          
          if (redirectResult) {
    
            // The auth state listener will handle the redirect
          }
        }
        
        // Reduced delay for faster loading
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
  
          
          if (firebaseUser) {
    
            
            try {
              // Set authentication cookie for server-side verification
              await FirebaseAuth.setAuthCookie(firebaseUser);
      
              
              setUser(firebaseUser);
              
              // Only redirect if there's a stored redirect destination (e.g., from sign-in)
              if (pathname !== '/auth/callback') {
                const redirectTo = sessionStorage.getItem('authRedirectTo');
                if (redirectTo) {
                  sessionStorage.removeItem('authRedirectTo'); // Clean up
                  router.push(redirectTo);
                }
                // Don't redirect if no specific destination is stored
              }
            } catch (err: any) {
              console.error('Error setting up user session:', err);
              setUser(null);
              // Don't redirect on error, let the user stay on current page
            }
          } else {
    
            setUser(null);
            
            // Clear authentication cookie
            await FirebaseAuth.clearAuthCookie();
            
            // Only redirect to sign-in if we're not already there and not on callback page
            if (pathname !== '/sign-in' && pathname !== '/sign-up' && pathname !== '/auth/callback') {
              router.push("/sign-in");
            }
          }
          
          setLoading(false);
          setInitialized(true);
        });
        
        return unsub;
      } catch (error: any) {
        console.error('Error setting up auth:', error);
        setLoading(false);
        setInitialized(true);
        return;
      }
    };

    let unsubscribe: Unsubscribe | null = null;
    setupAuth().then(unsub => {
      if (unsub) {
        unsubscribe = unsub;
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router, pathname]);

  // Don't render children until Firebase is initialized
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// For backward compatibility, keep the SessionProvider name
export const SessionProvider = AuthProvider; 