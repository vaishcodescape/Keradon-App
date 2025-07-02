import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Supabase sign out error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to sign out" },
        { status: 500 }
      );
    }
    
    const response = NextResponse.json({ success: true, message: "Signed out successfully" });
    
    // Clear all Supabase-related cookies
    response.cookies.set('sb-access-token', '', { maxAge: 0 });
    response.cookies.set('sb-refresh-token', '', { maxAge: 0 });
    
    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sign out" },
      { status: 500 }
    );
  }
} 