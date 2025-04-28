import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';
import { Logger } from '@/utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify user session
  const session = await getSession({ req });
  
  if (!session) {
    Logger.warn('UserProfileAPI', 'Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  try {
    switch (req.method) {
      case 'GET':
        // Fetch user profile
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          Logger.warn('UserProfileAPI', 'User profile not found', { userId });
          return res.status(404).json({ error: 'User profile not found' });
        }

        Logger.info('UserProfileAPI', 'User profile retrieved', { userId });
        return res.status(200).json(userSnap.data());

      case 'PUT':
        // Update user profile
        const updateData = req.body;

        // Validate update data
        const allowedFields = [
          'name', 
          'email', 
          'role', 
          'profileCompleted', 
          'walletAddress', 
          'specialization'
        ];

        const validatedUpdate = Object.keys(updateData)
          .filter(key => allowedFields.includes(key))
          .reduce((obj, key) => {
            obj[key] = updateData[key];
            return obj;
          }, {} as any);

        // Prevent overwriting critical fields
        if (Object.keys(validatedUpdate).length === 0) {
          Logger.warn('UserProfileAPI', 'No valid update fields', { userId });
          return res.status(400).json({ error: 'No valid update fields' });
        }

        const profileRef = doc(db, 'users', userId);
        await updateDoc(profileRef, {
          ...validatedUpdate,
          updatedAt: new Date().toISOString()
        });

        Logger.info('UserProfileAPI', 'User profile updated', { 
          userId, 
          updates: Object.keys(validatedUpdate) 
        });

        return res.status(200).json({ message: 'Profile updated successfully' });

      default:
        Logger.warn('UserProfileAPI', 'Method not allowed', { method: req.method });
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    Logger.error('UserProfileAPI', 'API error', { 
      error: error instanceof Error ? error.message : String(error),
      method: req.method
    });

    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}