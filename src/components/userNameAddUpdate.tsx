// Step 2: Create components/userNameAddUpdate.tsx
// components/userNameAddUpdate.tsx
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';




//-------------- lib function to get user profile: ----------------
import { getCurrentUserProfile} from '@/lib/getCurrentUserProfile';

//----------user name adding method: imported from addUserName.ts file in /lib:-------------
import { addUserNameDatabase } from '@/lib/addUserNameDatabase';




export function UserNameAddUpdate() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRecords, setUserRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  //--------add user name object for the form input:-------------
  const [userNameField, setUserNameField] = useState('');


  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setIsLoading(true);
        
        try {
          // Get user profile
          const profileResult = await getCurrentUserProfile();
          if (profileResult.success) {
            setUserProfile(profileResult.data);
          }
          


        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);


  //-----------handle input for add user name method:-----------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserNameField(e.target.value);
  };




  //---------------Method to handle when user name is inputted and clicked:--------------------
  // Add an Add User's Name function here, that will take input from a form, and put it into 
  // the function in userOperations, that will push it to the db, into the user's document.
  // addUserName()
//
  const handleAddUserName = async () => {
    await addUserNameDatabase(userNameField);
  };
//----------------------------------








// ------------- Print the User's profile document details, such as name, auth email, and such:  -----------------------------------------------------
// can be edited later to show more:
return (
    <div className="max-w-4xl mx-auto p-8">

      {/* checks first is email is null, if so, don't attempt to print email: */}
     <h1 className="text-3xl font-bold mb-6">
      {userProfile?.email || user?.email ? (
        `Welcome, ${userProfile?.email || user?.email}!`
      ) : (
        'Welcome!'
      )}
    </h1>

      
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        <p><strong>Email:</strong> {userProfile?.email}</p>
        <p><strong>Auth Method:</strong> {userProfile?.authMethod}</p>
        <p><strong>Email Verified:</strong> {userProfile?.emailVerified ? 'Yes' : 'No'}</p>
         <p><strong>User's Name:</strong> {userProfile?.FirstName}</p>
      </div>




  
  {/* -------------------Add user name: debug: ------------------------------------ */}
  {/* can be split into separate component later, for now this works to demonstrate data updates: */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div>
            <h2 className="text-xl font-semibold">Add your name:</h2>

            <input
            type="text"
            value={userNameField}
            onChange={handleInputChange}
            placeholder="Enter user name"
            className="border border-gray-300 px-3 py-2 rounded-md mr-2 mb-2"
          />
          
          <button onClick={handleAddUserName}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
                Add User Name
          </button>
        </div>
      </div>
 {/* Add user name: debug: ------------------------------------ */}








    </div>
  );
}
