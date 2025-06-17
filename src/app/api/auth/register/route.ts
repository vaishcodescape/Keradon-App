import { NextResponse } from 'next/server';
import { UserService } from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { user, session } = await UserService.createUser(email, password, name);

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
      },
      session: {
        accessToken: session?.access_token,
        refreshToken: session?.refresh_token,
      }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    
    if (error.message?.includes("already registered")) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: error.status || 500 }
    );
  }
} 