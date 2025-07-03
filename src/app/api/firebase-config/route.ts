import { NextResponse } from 'next/server';

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

    // Detailed logging for debugging
    console.log('Firebase Environment Variables Check:');
    console.log('FIREBASE_API_KEY:', process.env.FIREBASE_API_KEY ? 'SET' : 'MISSING');
    console.log('FIREBASE_AUTH_DOMAIN:', process.env.FIREBASE_AUTH_DOMAIN ? 'SET' : 'MISSING');
    console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'SET' : 'MISSING');
    console.log('FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET ? 'SET' : 'MISSING');
    console.log('FIREBASE_MESSAGING_SENDER_ID:', process.env.FIREBASE_MESSAGING_SENDER_ID ? 'SET' : 'MISSING');
    console.log('FIREBASE_APP_ID:', process.env.FIREBASE_APP_ID ? 'SET' : 'MISSING');

    // Validate all required fields are present
    const missingFields = Object.entries(config)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.warn('Firebase environment variables not found:', missingFields);
      return NextResponse.json(
        { 
          error: 'Firebase not configured',
          message: 'Please check your .env.local file contains all Firebase environment variables',
          missingFields,
          configured: false,
          debug: {
            FIREBASE_API_KEY: process.env.FIREBASE_API_KEY ? 'SET' : 'MISSING',
            FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN ? 'SET' : 'MISSING',
            FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'SET' : 'MISSING',
            FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET ? 'SET' : 'MISSING',
            FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID ? 'SET' : 'MISSING',
            FIREBASE_APP_ID: process.env.FIREBASE_APP_ID ? 'SET' : 'MISSING'
          }
        },
        { status: 200 } // Return 200 instead of 500 to avoid breaking the app
      );
    }

    return NextResponse.json({
      ...config,
      configured: true
    });
  } catch (error) {
    console.error('Error getting Firebase config:', error);
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