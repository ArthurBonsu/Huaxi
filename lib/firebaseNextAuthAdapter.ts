import type { Adapter, AdapterUser, AdapterAccount } from 'next-auth/adapters';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';
import { Logger } from '@/utils/logger';

// Extend the default user model with additional fields
export interface FirebaseUser extends Omit<AdapterUser, 'email'> {
  email: string;
  role?: 'patient' | 'doctor';
  profileCompleted?: boolean;
  walletAddress?: string;
}

// Type guard to convert FirebaseUser to AdapterUser
function toAdapterUser(user: FirebaseUser | null): AdapterUser | null {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name ?? undefined,
    email: user.email,
    emailVerified: user.emailVerified instanceof Date 
      ? user.emailVerified 
      : null,
    image: user.image ?? undefined
  };
}

// Define a more specific type for the adapter methods
const FirebaseAdapter: Adapter = {
  async createUser(user: Partial<AdapterUser>) {
    try {
      // Ensure we have a unique identifier and email
      if (!user.id) {
        throw new Error('User must have an ID');
      }
      if (!user.email) {
        throw new Error('User must have an email');
      }

      const userRef = doc(db, 'users', user.id);
      const userData: FirebaseUser = {
        id: user.id,
        name: user.name ?? undefined,
        email: user.email,
        emailVerified: user.emailVerified instanceof Date 
          ? user.emailVerified 
          : null,
        image: user.image ?? undefined,
        role: undefined,
        profileCompleted: false
      };

      await setDoc(userRef, userData);

      Logger.info('NextAuthFirebaseAdapter', 'User created', { 
        userId: user.id, 
        email: user.email 
      });

      return toAdapterUser(userData)!;
    } catch (error) {
      Logger.error('NextAuthFirebaseAdapter', 'Error creating user', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  },

  async getUser(id: string) {
    try {
      const userRef = doc(db, 'users', id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return null;

      Logger.debug('NextAuthFirebaseAdapter', 'User retrieved', { 
        userId: id 
      });

      return toAdapterUser(userSnap.data() as FirebaseUser);
    } catch (error) {
      Logger.error('NextAuthFirebaseAdapter', 'Error getting user', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  },

  async getUserByEmail(email: string) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return null;

      const userDoc = querySnapshot.docs[0];
      
      Logger.debug('NextAuthFirebaseAdapter', 'User retrieved by email', { 
        email 
      });

      return toAdapterUser(userDoc.data() as FirebaseUser);
    } catch (error) {
      Logger.error('NextAuthFirebaseAdapter', 'Error getting user by email', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  },

  async getUserByAccount(providerAccount: { 
    provider: string; 
    providerAccountId: string; 
  }) {
    try {
      const accountRef = doc(
        db, 
        'accounts', 
        `${providerAccount.provider}_${providerAccount.providerAccountId}`
      );
      const accountSnap = await getDoc(accountRef);

      if (!accountSnap.exists()) return null;

      const userId = accountSnap.data()?.userId;
      if (!userId) return null;

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return null;

      Logger.debug('NextAuthFirebaseAdapter', 'User retrieved by account', { 
        provider: providerAccount.provider 
      });

      return toAdapterUser(userSnap.data() as FirebaseUser);
    } catch (error) {
      Logger.error('NextAuthFirebaseAdapter', 'Error getting user by account', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  },

  async updateUser(user: Partial<AdapterUser> & { id: string }) {
    try {
      const userRef = doc(db, 'users', user.id);
      
      // Ensure email is not undefined when updating
      const updateData: Partial<FirebaseUser> = {
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        emailVerified: user.emailVerified instanceof Date 
          ? user.emailVerified 
          : null
      };

      // Only update email if it's provided
      if (user.email) {
        updateData.email = user.email;
      }

      await updateDoc(userRef, updateData);

      Logger.info('NextAuthFirebaseAdapter', 'User updated', { 
        userId: user.id 
      });

      const updatedUser = await getDoc(userRef);
      return toAdapterUser(updatedUser.data() as FirebaseUser)!;
    } catch (error) {
      Logger.error('NextAuthFirebaseAdapter', 'Error updating user', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  },

  async deleteUser(userId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Retrieve the user before deleting to satisfy the return type
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() 
        ? toAdapterUser(userSnap.data() as FirebaseUser) 
        : null;

      // Delete the user document
      await deleteDoc(userRef);

      // Also delete associated accounts
      const accountsRef = collection(db, 'accounts');
      const q = query(accountsRef, where('userId', '==', userId));
      const accountsSnapshot = await getDocs(q);
      
      const deleteAccountPromises = accountsSnapshot.docs.map(async (accountDoc) => {
        await deleteDoc(accountDoc.ref);
      });

      await Promise.all(deleteAccountPromises);

      Logger.info('NextAuthFirebaseAdapter', 'User deleted', { 
        userId 
      });

      // Return the user data or null
      return userData;
    } catch (error) {
      Logger.error('NextAuthFirebaseAdapter', 'Error deleting user', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  },
  async linkAccount(account: AdapterAccount) {
    try {
      const accountRef = doc(
        db, 
        'accounts', 
        `${account.provider}_${account.providerAccountId}`
      );
      
      await setDoc(accountRef, {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        type: account.type,
        userId: account.userId,
        accessToken: account.access_token,
        tokenType: account.token_type,
        refreshToken: account.refresh_token,
        expiresAt: account.expires_at,
        scope: account.scope,
        idToken: account.id_token
      });

      Logger.info('NextAuthFirebaseAdapter', 'Account linked', { 
        provider: account.provider, 
        userId: account.userId 
      });

      return account;
    } catch (error) {
      Logger.error('NextAuthFirebaseAdapter', 'Error linking account', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  },

  async unlinkAccount(params: { 
    provider: string; 
    providerAccountId: string; 
  }) {
    try {
      const accountRef = doc(
        db, 
        'accounts', 
        `${params.provider}_${params.providerAccountId}`
      );
      
      await deleteDoc(accountRef);

      Logger.info('NextAuthFirebaseAdapter', 'Account unlinked', { 
        provider: params.provider 
      });

      return true;
    } catch (error) {
      Logger.error('NextAuthFirebaseAdapter', 'Error unlinking account', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  },

  async createVerificationToken(verificationToken: {
    identifier: string;
    token: string;
    expires: Date;
  }) {
    try {
      const tokenRef = doc(db, 'verification_tokens', verificationToken.identifier);
      
      await setDoc(tokenRef, {
        ...verificationToken,
        expires: verificationToken.expires.toISOString()
      });

      Logger.info('NextAuthFirebaseAdapter', 'Verification token created', { 
        identifier: verificationToken.identifier 
      });

      return verificationToken;
    } catch (error) {
      Logger.error('NextAuthFirebaseAdapter', 'Error creating verification token', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  },

  async useVerificationToken(params: { 
    identifier: string; 
    token: string; 
  }) {
    try {
      const tokenRef = doc(db, 'verification_tokens', params.identifier);
      const tokenSnap = await getDoc(tokenRef);

      if (!tokenSnap.exists()) return null;

      const tokenData = tokenSnap.data();

      // Check token expiration
      if (tokenData && new Date(tokenData.expires) > new Date()) {
        // Delete the token after use
        await deleteDoc(tokenRef);

        Logger.info('NextAuthFirebaseAdapter', 'Verification token used', { 
          identifier: params.identifier 
        });

        return {
          identifier: tokenData.identifier,
          token: tokenData.token,
          expires: new Date(tokenData.expires)
        };
      }

      return null;
    } catch (error) {
      Logger.error('NextAuthFirebaseAdapter', 'Error using verification token', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }
};

export default FirebaseAdapter;