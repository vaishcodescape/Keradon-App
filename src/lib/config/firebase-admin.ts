import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Get project ID from server-side env var
const projectId = process.env.FIREBASE_PROJECT_ID;

// Add debugging information
console.log('Firebase Admin Configuration Debug:');
console.log('FIREBASE_PROJECT_ID:', projectId ? 'SET' : 'NOT SET');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT SET');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'NOT SET');
console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'SET' : 'NOT SET');

if (!projectId) {
  throw new Error('Missing required environment variable: FIREBASE_PROJECT_ID');
}

// Initialize Firebase Admin (only once)
let app;

try {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    // Full admin initialization with service account
    console.log('Firebase Admin: Using service account credentials');

    // Process the private key properly
    let privateKey = process.env.FIREBASE_PRIVATE_KEY!;

    // Try to parse if wrapped in quotes (double-escaped)
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      try {
        privateKey = JSON.parse(privateKey);
        console.log('Firebase Admin: Private key parsed with JSON.parse');
      } catch (e) {
        console.error('Firebase Admin: Failed to parse private key with JSON.parse:', e);
      }
    } else if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
      console.log('Firebase Admin: Private key replaced \\n with real newlines');
    }

    // Log the first 30 characters for debugging (do not log the full key)
    console.log('FIREBASE_PRIVATE_KEY (start):', privateKey.slice(0, 30));

    // Ensure the private key has proper formatting
    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      console.error('Firebase Admin: Invalid private key format');
      throw new Error('Invalid private key format');
    }

    try {
      app = !getApps().length ? initializeApp({
        credential: cert({
          projectId: projectId!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: privateKey,
        }),
        projectId: projectId!,
      }) : getApps()[0];
      console.log('Firebase Admin: Successfully initialized with service account');
    } catch (certError) {
      console.error('Firebase Admin: Failed to initialize with service account:', certError);
      throw certError;
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use application default credentials (for production environments)
    console.log('Firebase Admin: Using application default credentials');
    app = !getApps().length ? initializeApp({
      credential: applicationDefault(),
      projectId: projectId!,
    }) : getApps()[0];
  } else {
    // Basic initialization for development (limited functionality)
    console.log('Firebase Admin: Using basic initialization (limited functionality)');
    try {
      app = !getApps().length ? initializeApp({
        projectId: projectId!,
      }) : getApps()[0];
    } catch (basicError) {
      console.error('Firebase Admin basic initialization failed:', basicError);
      throw new Error('Firebase Admin initialization failed - check your environment variables');
    }
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  // If initialization fails, create a minimal app for basic operations
  console.log('Firebase Admin: Falling back to minimal initialization');
  try {
    app = !getApps().length ? initializeApp({
      projectId: projectId!,
    }) : getApps()[0];
  } catch (fallbackError) {
    console.error('Firebase Admin fallback initialization also failed:', fallbackError);
    throw new Error('Firebase Admin could not be initialized - please check your configuration');
  }
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

// Add a function to test the database connection
export async function testDatabaseConnection() {
  try {
    const testRef = adminDb.collection('_test_connection');
    await testRef.limit(1).get();
    console.log('Firebase Admin: Database connection test successful');
    return true;
  } catch (error) {
    console.error('Firebase Admin: Database connection test failed:', error);
    return false;
  }
}

export default app; 