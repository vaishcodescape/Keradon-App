import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session) {
      // Clear the session
      const response = NextResponse.json({ message: "Signed out successfully" });
      
      // Clear the session cookie
      response.cookies.delete("next-auth.session-token");
      response.cookies.delete("__Secure-next-auth.session-token");
      response.cookies.delete("next-auth.csrf-token");
      response.cookies.delete("__Host-next-auth.csrf-token");
      
      return response;
    }
    
    return NextResponse.json({ message: "No active session" });
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
} 