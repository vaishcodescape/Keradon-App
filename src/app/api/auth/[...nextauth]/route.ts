import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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

declare module "next-auth" {
  interface NextAuth {
    id: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
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
          const { user } = await UserService.signIn(
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
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 