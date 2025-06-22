import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session) {
      return NextResponse.json({
        authenticated: true,
        user: session.user,
        expires: session.expires,
      });
    }
    
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Session check failed" },
      { status: 500 }
    );
  }
} 