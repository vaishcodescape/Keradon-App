import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { UserService } from "@/lib/models/User";

declare module "next-auth" {
  interface User {
    id: string;
    accessToken?: string;
    refreshToken?: string;
  }
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { user, session } = await UserService.signIn(
            credentials.email,
            credentials.password
          );

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email,
            accessToken: session?.access_token,
            refreshToken: session?.refresh_token,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("JWT callback called with:", { 
        hasAccount: !!account, 
        hasUser: !!user, 
        accountProvider: account?.provider,
        userId: user?.id 
      });
      
      // Initial sign in
      if (account && user) {
        if (account.provider === "google") {
          // For Google OAuth, create or get user from Supabase
          try {
            console.log("Google OAuth user:", { 
              id: user.id, 
              email: user.email, 
              name: user.name 
            });
            
            const { user: supabaseUser } = await UserService.signInWithOAuth({
              email: user.email!,
              name: user.name || user.email!,
              provider: 'google',
              providerId: user.id,
              image: user.image,
            });
            
            if (!supabaseUser?.id) {
              console.error("Could not get or create Supabase user.");
              throw new Error("Failed to create Supabase user");
            }
            
            console.log("Supabase user created/found:", { 
              id: supabaseUser.id, 
              email: supabaseUser.email 
            });
            
            const newToken = {
              ...token,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              id: supabaseUser.id,
            };
            
            console.log("Returning new token with ID:", newToken.id);
            return newToken;
          } catch (error) {
            console.error("Google OAuth error:", error);
            throw error; // This will cause the sign-in to fail
          }
        } else {
          // For credentials provider
          if (!user.id) {
            console.error("No user ID for credentials provider");
            throw new Error("Invalid user ID");
          }
          return {
            ...token,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            id: user.id,
          };
        }
      }
      console.log("Returning existing token with ID:", token.id);
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token.refreshToken) {
        session.refreshToken = token.refreshToken as string;
      }
      
      console.log("Session created with user ID:", session.user.id);
      
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}; 