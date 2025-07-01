import { supabase } from '@/lib/config/supabase';
import { supabaseAdmin } from '@/lib/config/supabase-admin';
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
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
        await this.ensureUserInDatabase(data.user);
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

      // Get user data from our users table
      const userData = await this.getUserData(session.user.id);
      
      const authSession: AuthSession = {
        user: userData || {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!,
          avatar_url: session.user.user_metadata?.avatar_url,
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
        await this.ensureUserInDatabase(session.user);
        const { session: authSession } = await this.getSession();
        callback(authSession);
      } else {
        callback(null);
      }
    });
  }

  // Private helper methods
  private static async ensureUserInDatabase(user: User) {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingUser) {
        const { error } = await supabaseAdmin
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.email!,
            avatar_url: user.user_metadata?.avatar_url,
            provider: this.getProvider(user),
            created_at: user.created_at,
            updated_at: new Date().toISOString(),
          });

        if (error && error.code !== '23505') { // Ignore duplicate key errors
          console.error('Error creating user in database:', error);
        }
      }
    } catch (error) {
      console.error('Error ensuring user in database:', error);
    }
  }

  private static async getUserData(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  private static getProvider(user: User): string {
    return user.app_metadata?.provider || 'email';
  }
} 