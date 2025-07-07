import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Get project ID from server-side env var
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!projectId) {
  throw new Error('Missing required environment variable: FIREBASE_PROJECT_ID');
}

// Initialize Firebase Admin (only once)
let app;

try {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    // Full admin initialization with service account
    app = !getApps().length ? initializeApp({
      credential: cert({
        projectId: projectId!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
      projectId: projectId!,
    }) : getApps()[0];
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use application default credentials (for production environments)
    app = !getApps().length ? initializeApp({
      credential: applicationDefault(),
      projectId: projectId!,
    }) : getApps()[0];
  } else {
    // Basic initialization for development (limited functionality)
    // This will work for basic operations but may fail for admin operations
    app = !getApps().length ? initializeApp({
      projectId: projectId!,
    }) : getApps()[0];
  }
} catch (error) {
  // If initialization fails, create a minimal app for basic operations
  app = !getApps().length ? initializeApp({
    projectId: projectId!,
  }) : getApps()[0];
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export default app; 