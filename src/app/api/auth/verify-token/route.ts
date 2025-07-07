import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/config/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Get the token from the request
    const body = await request.json();
    const { idToken } = body;
    
    // Also check Authorization header as fallback
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    const tokenToVerify = idToken || headerToken;
    
    if (!tokenToVerify) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 400 }
      );
    }
    
    // Verify the token using Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(tokenToVerify);
    
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Return user information
    return NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        authTime: decodedToken.auth_time,
        issueTime: decodedToken.iat,
        expireTime: decodedToken.exp,
      },
      message: 'Token verified successfully'
    });
    
  } catch (error: any) {
    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { error: 'Token expired', code: 'TOKEN_EXPIRED' },
        { status: 401 }
      );
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return NextResponse.json(
        { error: 'Token revoked', code: 'TOKEN_REVOKED' },
        { status: 401 }
      );
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return NextResponse.json(
        { error: 'Invalid token format', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to verify tokens.' },
    { status: 405 }
  );
} 