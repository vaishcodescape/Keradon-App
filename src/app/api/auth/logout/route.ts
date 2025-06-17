import { NextResponse } from 'next/server';
import { UserService } from '@/lib/models/User';

export async function POST() {
  try {
    await UserService.signOut();
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
} 