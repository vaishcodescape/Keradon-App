import { supabase } from '@/lib/config/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export class SupabaseAuth {
  // Google OAuth Sign In
  static async signInWithGoogle() {
    try {
      console.log('Initiating Google OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'email profile'
        }
      });

      if (error) {
        console.error('Google OAuth initiation error:', error);
        throw new Error(error.message);
      }

      console.log('Google OAuth initiated successfully:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      return { data: null, error: error.message };
    }
  }

  // Email/Password Sign In
  static async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Ensure user exists in our users table
      if (data.user) {
        // Create user record immediately (non-blocking)
        fetch('/api/auth/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }).catch(userCreateError => {
          console.warn('Error creating user record:', userCreateError);
          // Don't fail the auth process if user creation fails
        });
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Email sign in error:', error);
      return { data: null, error: error.message };
    }
  }

  // Email/Password Sign Up
  static async signUpWithEmail(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Email sign up error:', error);
      return { data: null, error: error.message };
    }
  }

  // Sign Out
  static async signOut() {
    try {
      // Call the API endpoint to clear server-side cookies
      try {
        await fetch('/api/auth/signout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (apiError) {
        console.warn('API signout failed, continuing with client signout:', apiError);
      }
      
      // Sign out from Supabase client
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: error.message };
    }
  }

  // Get Current Session
  static async getSession(): Promise<{ session: AuthSession | null; error: string | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      if (!session) return { session: null, error: null };

      // Try to get user data from our users table, but don't fail if table doesn't exist
      let userData: AuthUser | null = null;
      try {
        userData = await this.getUserData(session.user.id);
      } catch (dbError) {
        console.warn('Could not fetch user data from database, using auth data:', dbError);
      }
      
      // Use database data if available, otherwise fall back to auth user metadata
      const authSession: AuthSession = {
        user: userData || {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email!,
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
          provider: this.getProvider(session.user),
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at,
        },
        access_token: session.access_token,
        refresh_token: session.refresh_token!,
        expires_at: session.expires_at!,
      };

      return { session: authSession, error: null };
    } catch (error: any) {
      console.error('Get session error:', error);
      return { session: null, error: error.message };
    }
  }

  // Get Current User
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    const { session, error } = await this.getSession();
    if (error) return { user: null, error };
    return { user: session?.user || null, error: null };
  }

  // Refresh Session
  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Refresh session error:', error);
      return { data: null, error: error.message };
    }
  }

  // Listen to auth changes
  static onAuthStateChange(callback: (session: AuthSession | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { session: authSession } = await this.getSession();
        callback(authSession);
      } else {
        callback(null);
      }
    });
  }

  // Private helper methods
  private static async getUserData(userId: string): Promise<AuthUser | null> {
    try {
      // Ensure Accept header is set to application/json to avoid 406 errors
      const { data, error } = await supabase
        .from('users')
        .select('*', { head: false })
        .eq('id', userId)
        .single();
      // If you get a 406 error, check RLS policies and that the Accept header is application/json
      if (error) throw error;
      return data as AuthUser;
    } catch (error) {
      throw error;
    }
  }

  private static getProvider(user: User): string {
    return user.app_metadata?.provider || 'email';
  }
} 