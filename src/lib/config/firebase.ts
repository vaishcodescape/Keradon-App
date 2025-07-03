import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

// Cache for Firebase services
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

// Fetch Firebase configuration securely from API
async function getFirebaseConfig() {
  try {
    // Only fetch from API in browser environment
    if (typeof window === 'undefined') {
      throw new Error('Firebase config can only be fetched in browser environment');
    }
    
    const response = await fetch('/api/firebase-config');
    if (!response.ok) {
      throw new Error(`Failed to fetch Firebase config: ${response.statusText}`);
    }
    const config = await response.json();
    
    if (!config.configured) {
      throw new Error(config.message || 'Firebase not configured - please set up environment variables');
    }
    
    // Remove the configured flag before returning
    const { configured, ...firebaseConfig } = config;
    return firebaseConfig;
  } catch (error) {
    console.error('Error fetching Firebase config:', error);
    throw error;
  }
}

// Initialize Firebase app
async function initializeFirebaseApp(): Promise<FirebaseApp> {
  if (app) return app;

  try {
    const firebaseConfig = await getFirebaseConfig();
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    return app;
  } catch (error) {
    console.error('Failed to initialize Firebase app:', error);
    throw error;
  }
}

// Get Auth instance
export async function getFirebaseAuth(): Promise<Auth> {
  if (authInstance) return authInstance;
  
  const firebaseApp = await initializeFirebaseApp();
  authInstance = getAuth(firebaseApp);
  
  // Disable emulator connections for now to avoid auth/internal-error
  // Connect to emulator in development (disabled temporarily)
  // if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  //   try {
  //     if (!authInstance.emulatorConfig) {
  //       connectAuthEmulator(authInstance, 'http://localhost:9099');
  //     }
  //   } catch (error) {
  //     console.log('Firebase Auth emulator already connected or not available');
  //   }
  // }
  
  return authInstance;
}

// Get Firestore instance
export async function getFirebaseDb(): Promise<Firestore> {
  if (dbInstance) return dbInstance;
  
  const firebaseApp = await initializeFirebaseApp();
  dbInstance = getFirestore(firebaseApp);
  
  // Disable emulator connections for now
  // Connect to emulator in development (disabled temporarily)
  // if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  //   try {
  //     // Check if emulator is already connected by trying to connect
  //     connectFirestoreEmulator(dbInstance, 'localhost', 8080);
  //   } catch (error) {
  //     console.log('Firestore emulator already connected or not available');
  //   }
  // }
  
  return dbInstance;
}

// Get Storage instance
export async function getFirebaseStorage(): Promise<FirebaseStorage> {
  if (storageInstance) return storageInstance;
  
  const firebaseApp = await initializeFirebaseApp();
  storageInstance = getStorage(firebaseApp);
  
  // Disable emulator connections for now
  // Connect to emulator in development (disabled temporarily)
  // if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  //   try {
  //     // Check if emulator is already connected by trying to connect
  //     connectStorageEmulator(storageInstance, 'localhost', 9199);
  //   } catch (error) {
  //     console.log('Firebase Storage emulator already connected or not available');
  //   }
  // }
  
  return storageInstance;
}

// Legacy exports for backward compatibility (these will be async)
// Only initialize in browser environment to prevent server-side errors
export const auth = typeof window !== 'undefined' ? getFirebaseAuth() : null;
export const db = typeof window !== 'undefined' ? getFirebaseDb() : null;
export const storage = typeof window !== 'undefined' ? getFirebaseStorage() : null;

// Check if Firebase is configured without throwing errors
export async function isFirebaseConfigured(): Promise<boolean> {
  try {
    const response = await fetch('/api/firebase-config');
    if (!response.ok) return false;
    const config = await response.json();
    return config.configured === true;
  } catch {
    return false;
  }
}

export default initializeFirebaseApp; 