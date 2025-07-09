import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/config/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Test Firebase endpoint: Starting connection test');
    
    // Test basic Firestore connection
    const testRef = adminDb.collection('test');
    const testSnapshot = await testRef.limit(1).get();
    
    console.log('Test Firebase endpoint: Connection successful');
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test Firebase endpoint: Connection failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Firebase connection failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 