import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/config/firebase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}

export class FirebaseAuth {
  // Google OAuth Sign In with Popup
  static async signInWithGoogle() {
    try {
      const auth = await getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Add custom parameters for better OAuth flow
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Use popup method for better user experience
      const result = await signInWithPopup(auth, provider);
      
      // Create or update user document
      await this.createOrUpdateUserDocument(result.user);
      
      // Set authentication cookie
      await this.setAuthCookie(result.user);
      
      return { data: result, error: null };
      
    } catch (error: any) {
      // Provide user-friendly error messages for popup-specific errors
      let userFriendlyError = 'Sign in failed. Please try again.';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          userFriendlyError = 'Sign in was cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          userFriendlyError = 'Popup was blocked. Please allow popups for this site and try again.';
          break;
        case 'auth/cancelled-popup-request':
          userFriendlyError = 'Sign in was cancelled. Please try again.';
          break;
        case 'auth/account-exists-with-different-credential':
          userFriendlyError = 'An account already exists with this email using a different sign-in method.';
          break;
        case 'auth/operation-not-allowed':
          userFriendlyError = 'Google sign-in is not enabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          userFriendlyError = 'Network error. Please check your connection and try again.';
          break;
        default:
          userFriendlyError = error.message || 'Sign in failed. Please try again.';
      }
      
      return { data: null, error: userFriendlyError };
    }
  }

  // Email/Password Sign In
  static async signInWithEmail(email: string, password: string) {
    try {
      const auth = await getFirebaseAuth();
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Set authentication cookie
      await this.setAuthCookie(result.user);
      
      return { data: result, error: null };
    } catch (error: any) {
      // Provide more user-friendly error messages
      let userFriendlyError = 'Sign in failed. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          userFriendlyError = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          userFriendlyError = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/user-not-found':
          userFriendlyError = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          userFriendlyError = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-credential':
          userFriendlyError = 'Invalid email or password. Please check your credentials.';
          break;
        case 'auth/too-many-requests':
          userFriendlyError = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          userFriendlyError = 'Network error. Please check your connection and try again.';
          break;
        default:
          userFriendlyError = error.message || 'Sign in failed. Please try again.';
      }
      
      return { data: null, error: userFriendlyError };
    }
  }

  // Email/Password Sign Up
  static async signUpWithEmail(email: string, password: string, name: string) {
    try {
      const auth = await getFirebaseAuth();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with name
      await updateProfile(result.user, {
        displayName: name,
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      });

      // Create user document
      await this.createOrUpdateUserDocument(result.user, name);
      
      // Set authentication cookie
      await this.setAuthCookie(result.user);
      
      return { data: result, error: null };
    } catch (error: any) {
      // Provide user-friendly error messages based on Firebase error codes
      let userFriendlyError = 'Sign up failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          userFriendlyError = 'auth/email-already-in-use';
          break;
        case 'auth/invalid-email':
          userFriendlyError = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          userFriendlyError = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/operation-not-allowed':
          userFriendlyError = 'Email/password sign up is not enabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          userFriendlyError = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/too-many-requests':
          userFriendlyError = 'Too many failed attempts. Please try again later.';
          break;
        default:
          userFriendlyError = error.message || 'Sign up failed. Please try again.';
      }
      
      return { data: null, error: userFriendlyError };
    }
  }

  // Sign Out
  static async signOut() {
    try {
      const auth = await getFirebaseAuth();
      await firebaseSignOut(auth);
      
      // Clear authentication cookie
      await this.clearAuthCookie();
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Set authentication cookie (server-side via API route)
  static async setAuthCookie(user: User, forceRefresh: boolean = false) {
    try {
      const token = await user.getIdToken(forceRefresh);
      // POST token to API route to set cookie server-side
      await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
        credentials: 'include',
      });
    } catch (error: any) {
      // Don't throw error for cookie issues as they're not critical for auth flow
    }
  }

  // Clear authentication cookie
  static async clearAuthCookie() {
    try {
      document.cookie = 'firebase-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch (error: any) {
      // Silent fail for cookie clearing
    }
  }

  // Handle redirect result (for OAuth redirect flow)
  static async handleRedirectResult() {
    try {
      const auth = await getFirebaseAuth();
      const result = await getRedirectResult(auth);
      
      if (result) {
        // Create or update user document
        await this.createOrUpdateUserDocument(result.user);
        
        // Set authentication cookie
        await this.setAuthCookie(result.user);
        
        return { data: result, error: null };
      }
      
      return { data: null, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Get Current Session
  static async getSession(): Promise<{ session: AuthSession | null; error: string | null }> {
    try {
      const auth = await getFirebaseAuth();
      const user = auth.currentUser;
      
      if (!user) return { session: null, error: null };

      // Get user data from Firestore
      const userData = await this.getUserData(user.uid);
      
      if (!userData) {
        await this.createOrUpdateUserDocument(user);
        const newUserData = await this.getUserData(user.uid);
        if (!newUserData) {
          throw new Error('Failed to create user document');
        }
      }

      const accessToken = await user.getIdToken();
      
      const authSession: AuthSession = {
        user: userData || {
          id: user.uid,
          email: user.email!,
          name: user.displayName || user.email!,
          avatar_url: user.photoURL || undefined,
          provider: this.getProvider(user),
          created_at: user.metadata.creationTime!,
          updated_at: user.metadata.lastSignInTime || user.metadata.creationTime!,
        },
        access_token: accessToken,
      };

      return { session: authSession, error: null };
    } catch (error: any) {
      return { session: null, error: error.message };
    }
  }

  // Get Firebase User directly (simpler approach)
  static async getCurrentFirebaseUser() {
    try {
      const auth = await getFirebaseAuth();
      return auth.currentUser;
    } catch (error: any) {
      return null;
    }
  }

  // Get Current User
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    const { session, error } = await this.getSession();
    if (error) return { user: null, error };
    return { user: session?.user || null, error: null };
  }

  // Refresh Session (get new token)
  static async refreshSession() {
    try {
      const auth = await getFirebaseAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
      
      const token = await user.getIdToken(true); // Force refresh
      return { data: { access_token: token }, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Get fresh ID token with force refresh
  static async getFreshIdToken(forceRefresh: boolean = true) {
    try {
      const auth = await getFirebaseAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No user logged in');
      }
      
      const idToken = await user.getIdToken(forceRefresh);
      
      return { token: idToken, error: null };
    } catch (error: any) {
      return { token: null, error: error.message };
    }
  }

  // Send token to backend via HTTPS
  static async sendTokenToBackend(endpoint: string = '/api/auth/verify-token') {
    try {
      const { token, error } = await this.getFreshIdToken(true);
      
      if (error || !token) {
        throw new Error(error || 'Failed to get ID token');
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ idToken: token }),
      });
      
      if (!response.ok) {
        throw new Error(`Backend request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Listen to auth changes
  static async onAuthStateChange(callback: (session: AuthSession | null) => void) {
    const auth = await getFirebaseAuth();
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Set authentication cookie for server-side verification
          await this.setAuthCookie(user);
          
          const { session } = await this.getSession();
          callback(session);
        } catch (error) {
          callback(null);
        }
      } else {
        // Clear cookie when user signs out
        await this.clearAuthCookie();
        callback(null);
      }
    });
  }

  // Private helper methods
  private static async getUserData(userId: string): Promise<AuthUser | null> {
    try {
      const db = await getFirebaseDb();
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          email: data.email,
          name: data.name,
          avatar_url: data.avatar_url,
          provider: data.provider,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private static async createOrUpdateUserDocument(user: User, customName?: string): Promise<void> {
    try {
      const db = await getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      const userData = {
        email: user.email!,
        name: customName || user.displayName || user.email!,
        avatar_url: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email!)}`,
        provider: this.getProvider(user),
        updated_at: serverTimestamp(),
      };

      if (userDoc.exists()) {
        // Update existing user
        await updateDoc(userRef, userData);
      } else {
        // Create new user
        await setDoc(userRef, {
          ...userData,
          created_at: serverTimestamp(),
        });
      }
    } catch (error) {
      throw error;
    }
  }

  private static getProvider(user: User): string {
    return user.providerData[0]?.providerId || 'password';
  }
} 