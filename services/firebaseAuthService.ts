import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    TwitterAuthProvider, 
    GithubAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    User
  } from 'firebase/auth';
  import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
  import { auth, db } from './firebaseConfig';
  import { Logger } from '@/utils/logger';
  
  // Define user profile interface
  export interface UserProfile {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    role?: 'patient' | 'doctor';
    profileCompleted?: boolean;
    walletAddress?: string;
    specialization?: string;
    createdAt: number;
    lastLogin?: number;
  }
  
  class FirebaseAuthService {
    // Create user profile in Firestore
    private async createUserProfile(user: User, additionalInfo: Partial<UserProfile> = {}) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const profileData: UserProfile = {
          uid: user.uid,
          email: user.email || undefined,
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          role: additionalInfo.role || undefined,
          profileCompleted: false,
          createdAt: Date.now(),
          lastLogin: Date.now(),
          ...additionalInfo
        };
  
        await setDoc(userRef, profileData, { merge: true });
        
        Logger.info('FirebaseAuthService', 'User profile created', { 
          uid: user.uid, 
          email: user.email 
        });
  
        return profileData;
      } catch (error) {
        Logger.error('FirebaseAuthService', 'Error creating user profile', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    }
  
    // Google Sign In
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        await this.createUserProfile(user);
        
        Logger.info('FirebaseAuthService', 'Google sign in successful', { 
          uid: user.uid 
        });
        
        return user;
      } catch (error) {
        Logger.error('FirebaseAuthService', 'Google sign in failed', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    }
  
    // Twitter Sign In
    async signInWithTwitter() {
      const provider = new TwitterAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        await this.createUserProfile(user);
        
        Logger.info('FirebaseAuthService', 'Twitter sign in successful', { 
          uid: user.uid 
        });
        
        return user;
      } catch (error) {
        Logger.error('FirebaseAuthService', 'Twitter sign in failed', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    }
  
    // GitHub Sign In
    async signInWithGitHub() {
      const provider = new GithubAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        await this.createUserProfile(user);
        
        Logger.info('FirebaseAuthService', 'GitHub sign in successful', { 
          uid: user.uid 
        });
        
        return user;
      } catch (error) {
        Logger.error('FirebaseAuthService', 'GitHub sign in failed', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    }
  
    // Email Sign Up
    async signUpWithEmail(email: string, password: string, additionalInfo: Partial<UserProfile> = {}) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await this.createUserProfile(user, additionalInfo);
        
        Logger.info('FirebaseAuthService', 'Email sign up successful', { 
          uid: user.uid, 
          email: user.email 
        });
        
        return user;
      } catch (error) {
        Logger.error('FirebaseAuthService', 'Email sign up failed', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    }
  
    // Email Sign In
    async signInWithEmail(email: string, password: string) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update last login
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { 
          lastLogin: Date.now() 
        }, { merge: true });
        
        Logger.info('FirebaseAuthService', 'Email sign in successful', { 
          uid: user.uid 
        });
        
        return user;
      } catch (error) {
        Logger.error('FirebaseAuthService', 'Email sign in failed', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    }
  
    // Password Reset
    async resetPassword(email: string) {
      try {
        await sendPasswordResetEmail(auth, email);
        
        Logger.info('FirebaseAuthService', 'Password reset email sent', { 
          email 
        });
        
        return true;
      } catch (error) {
        Logger.error('FirebaseAuthService', 'Password reset failed', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    }
  
    // Get User Profile
    async getUserProfile(uid: string): Promise<UserProfile | null> {
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          return userSnap.data() as UserProfile;
        }
        
        return null;
      } catch (error) {
        Logger.error('FirebaseAuthService', 'Error fetching user profile', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    }
  
    // Update User Profile
    async updateUserProfile(uid: string, updateData: Partial<UserProfile>) {
      try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, updateData, { merge: true });
        
        Logger.info('FirebaseAuthService', 'User profile updated', { 
          uid, 
          updates: Object.keys(updateData) 
        });
        
        return true;
      } catch (error) {
        Logger.error('FirebaseAuthService', 'Error updating user profile', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    }
  
    // Sign Out
    async signOut() {
      try {
        await signOut(auth);
        
        Logger.info('FirebaseAuthService', 'User signed out');
        
        return true;
      } catch (error) {
        Logger.error('FirebaseAuthService', 'Sign out failed', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    }
  }
  
  export default new FirebaseAuthService();