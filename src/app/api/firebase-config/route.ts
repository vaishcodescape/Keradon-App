import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/config/firebase-admin';

export async function GET() {
  try {
    // Check if Firebase is configured - use private server-side variables
    const config = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    };

    // Validate all required fields are present
    const missingFields = Object.entries(config)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Firebase not configured',
          message: 'Please check your .env.local file contains all Firebase environment variables',
          missingFields,
          configured: false
        },
        { status: 200 } // Return 200 instead of 500 to avoid breaking the app
      );
    }

    // Test Firebase Admin connection (optional - don't fail if it doesn't work)
    let adminStatus = 'unknown';
    try {
      // This will throw an error if Firebase Admin is not properly configured
      await adminAuth.listUsers(1);
      adminStatus = 'working';
    } catch (adminError: any) {
      // If it's a permissions error, that's expected for basic config
      // If it's a configuration error, we should report it
      if (adminError.code === 'auth/insufficient-permission') {
        adminStatus = 'limited';
      } else if (adminError.code === 'auth/invalid-credential') {
        adminStatus = 'no-credentials';
      } else {
        adminStatus = 'error';
      }
    }

    return NextResponse.json({
      ...config,
      configured: true,
      adminStatus
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to get Firebase configuration',
        configured: false,
        message: 'Firebase configuration error'
      },
      { status: 200 } // Return 200 to avoid breaking the app
    );
  }
} 