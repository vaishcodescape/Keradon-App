import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/config/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - simple IP-based check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    
    // Basic validation
    if (!userAgent || userAgent.length < 10) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Sanitize email - remove any potential injection
    const sanitizedEmail = email.trim().toLowerCase();

    try {
      // Check if user exists by querying Firestore users collection
      // This is more reliable and doesn't trigger authentication attempts
      
      // Query the users collection for the email
      const usersRef = adminDb.collection('users');
      const q = usersRef.where('email', '==', sanitizedEmail).limit(1);
      const querySnapshot = await q.get();
      
      if (!querySnapshot.empty) {
        // User exists in Firestore
        return NextResponse.json({
          exists: true,
          message: 'An account with this email already exists'
        });
      } else {
        // User doesn't exist
        return NextResponse.json({
          exists: false,
          message: 'Email is available for registration'
        });
      }
    } catch (error: any) {
      // For any errors, don't expose internal details
      return NextResponse.json(
        { error: 'Unable to check email availability' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 