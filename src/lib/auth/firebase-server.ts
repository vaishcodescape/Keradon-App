import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/config/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

export async function createAuthenticatedClient() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;
    
    if (!token) {
      return {
        user: null,
        session: null,
        error: 'No authentication token found',
      };
    }

    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    return {
      user: decodedToken,
      session: { access_token: token },
      error: null,
    };
  } catch (error: any) {
    console.error('Auth verification error:', error);
    return {
      user: null,
      session: null,
      error: error.message,
    };
  }
}

export async function getServerSession(): Promise<{
  user: DecodedIdToken | null;
  error: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;
    
    if (!token) {
      return { user: null, error: 'No token found' };
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    return { user: decodedToken, error: null };
  } catch (error: any) {
    console.error('Server session error:', error);
    return { user: null, error: error.message };
  }
} 