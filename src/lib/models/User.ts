import { supabase } from '@/lib/config/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export class UserService {
  static async createUser(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteUser(id: string) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }

      if (!data.user) {
        throw new Error("No user found after sign in");
      }

      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async signInWithOAuth(oauthData: {
    email: string;
    name: string;
    provider: string;
    providerId: string;
    image?: string | null;
  }) {
    try {
      // First, try to find existing user by email
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', oauthData.email)
        .single();

      if (existingUser && !findError) {
        // User exists, return them
        return { user: existingUser };
      }

      // User doesn't exist, create new user record
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: oauthData.email,
          name: oauthData.name,
          provider: oauthData.provider,
          provider_id: oauthData.providerId,
          avatar_url: oauthData.image,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating OAuth user:", createError);
        throw createError;
      }

      return { user: newUser };
    } catch (error) {
      console.error("OAuth sign in error:", error);
      throw error;
    }
  }
} 