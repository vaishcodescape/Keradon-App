import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Missing idToken' }, { status: 400 });
    }

    // Set cookie for 7 days
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    const isLocalhost = process.env.NODE_ENV !== 'production';
    const cookieOptions = [
      `Path=/`,
      `Expires=${expires.toUTCString()}`,
      isLocalhost ? 'SameSite=Lax' : 'SameSite=None; Secure',
    ];

    const response = NextResponse.json({ success: true });
    response.headers.append(
      'Set-Cookie',
      `firebase-token=${idToken}; ${cookieOptions.join('; ')}`
    );
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
} 