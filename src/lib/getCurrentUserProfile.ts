// lib/userOperations.ts - Functions to access user data
import { collection, doc, addDoc, updateDoc, getDocs, getDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
// import { useAuthState } from 'react-firebase-hooks/auth'; // Popular hook library

// GetCurrentUserProfile

// Get current user's profile from Firestore
export const getCurrentUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
};

