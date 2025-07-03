import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Get project ID from server-side env var
const projectId = process.env.FIREBASE_PROJECT_ID;

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_CLIENT_EMAIL', 
  'FIREBASE_PRIVATE_KEY'
];

const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (!projectId) {
  throw new Error('Missing required environment variable: FIREBASE_PROJECT_ID');
}

if (missingVars.length > 0) {
  console.warn(`Missing Firebase Admin environment variables: ${missingVars.join(', ')}`);
  console.warn('Firebase Admin features will be limited without service account credentials');
}

// Initialize Firebase Admin (only once)
let app;

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
} else {
  // Basic initialization for development (limited functionality)
  app = !getApps().length ? initializeApp({
    projectId: projectId!,
  }) : getApps()[0];
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export default app; 