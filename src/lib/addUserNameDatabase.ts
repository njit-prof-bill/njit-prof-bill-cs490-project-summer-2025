



import { collection, doc, addDoc, updateDoc, getDocs, getDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';







//------------------------------------------------------------

    // Adding a new field and string to the user document:
    
    export const addUserNameDatabase = async (userName: string) => {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
           FirstName: userName,
        });

    };


//------------------------------------------------------------








