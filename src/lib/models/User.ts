import { supabase } from '@/lib/config/supabase';
import { supabaseAdmin } from '@/lib/config/supabase-admin';

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
    console.log("signInWithOAuth called with:", oauthData);
    
    try {
      const { data: existingUser, error: findUserError } = await supabase
        .from('users')
        .select('*')
        .eq('email', oauthData.email)
        .single();

      console.log("Existing user lookup result:", { existingUser, findUserError });

      if (findUserError && findUserError.code !== 'PGRST116') {
        console.error('Error finding user:', findUserError);
        throw findUserError;
      }
      
      if (existingUser) {
        console.log("Returning existing user:", existingUser);
        return { user: existingUser };
      }

      console.log("No existing user found, creating new one...");
      
      const { data: { users }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();
      if (listUsersError) {
        console.error('Error listing users:', listUsersError);
        throw listUsersError;
      }
      
      const authUser = users.find(user => user.email === oauthData.email);
      console.log("Auth user lookup result:", { authUser, totalUsers: users.length });

      let authUserId: string;

      if (authUser) {
        authUserId = authUser.id;
        console.log("Using existing auth user ID:", authUserId);
      } else {
        console.log("Creating new auth user...");
        const { data: newAuthUser, error: createAuthUserError } = await supabaseAdmin.auth.admin.createUser({
          email: oauthData.email,
          email_confirm: true,
          user_metadata: {
            name: oauthData.name,
            avatar_url: oauthData.image,
          },
        });

        if (createAuthUserError) {
          console.error('Error creating Supabase Auth user for OAuth:', createAuthUserError);
          throw createAuthUserError;
        }
        authUserId = newAuthUser.user.id;
        console.log("Created new auth user with ID:", authUserId);
      }

      console.log("Creating public user record with auth ID:", authUserId);
      
      const { data: newUser, error: createPublicUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authUserId,
          email: oauthData.email,
          name: oauthData.name,
          provider: oauthData.provider,
          provider_id: oauthData.providerId,
          avatar_url: oauthData.image,
        })
        .select()
        .single();

      if (createPublicUserError) {
        console.error('Error creating user in public.users table:', createPublicUserError);
        throw createPublicUserError;
      }

      console.log("Successfully created public user:", newUser);
      return { user: newUser };

    } catch (error) {
      console.error("OAuth sign in error:", error);
      throw error;
    }
  }
} 