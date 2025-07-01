import { NextResponse } from 'next/server';
import { UserService } from '@/lib/models/User';
import { redirect } from 'next/navigation';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      );
    }

    const data = await UserService.signIn(email, password);
    return NextResponse.json(data);
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
} 