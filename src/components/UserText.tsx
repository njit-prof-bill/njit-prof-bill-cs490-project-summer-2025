import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../lib/firebase'; // Adjust the import
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';















const UserText: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [jsonObject, setJsonObject] = useState<any | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const docRef = doc(firestore, 'users', user.uid, 'userDocuments', 'categoryData');
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const textStr = data.aiResponse; // assuming this is your JSON string

            //  console.log('Fetched text string:', textStr);
            setRawText(textStr);

            // Parse JSON string
            try {
              const parsed = JSON.parse(textStr);
              setJsonObject(parsed);
            } catch (parseError) {
              setError('Invalid JSON format');
            }
          } else {
            setError('Document not found');
          }
        } catch (err) {
          setError('Failed to fetch data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Pretty-print JSON
  const prettyJson = jsonObject ? JSON.stringify(jsonObject, null, 2) : null;

  return (
    <div  style={{
        // backgroundColor: '#181818',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: 'inset 0 0 15px rgba(74, 74, 74, 0.6)',
      }}>

        <h2>Name: {jsonObject.fullName}</h2>
        <h2>Contact:</h2>
        <h2>Email: {jsonObject.contact.email}</h2>
        <h2>Phone: {jsonObject.contact.phone}</h2>
        <h2>Location: {jsonObject.contact.location}</h2>

         <div>
      {Object.keys(jsonObject).map((key) => {
        const value = (jsonObject as any)[key];

        if (typeof value === 'string') {
          return (
            <div key={key}>
              <strong>{key}:</strong> {value}
            </div>
          );
        } else if (Array.isArray(value)) {
          if (key === 'skills') {
            return (
              <div key={key}>
                <strong>{key}:</strong>
                <ul>
                  {value.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          } else if (key === 'experience' || key === 'education') {
            return (
              <div key={key}>
                <h3>{key}:</h3>
                {value.map((item: any, index: number) => (
                  <div key={index} style={{ marginLeft: '1em', marginBottom: '1em' }}>
                    {Object.entries(item).map(([subKey, subValue]: [string, any]) => (
                    <div key={subKey}>
                        <strong>{subKey}:</strong> {Array.isArray(subValue) ? (subValue as string[]).join(', ') : subValue}
                    </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          } else {
            // For other array types
            return (
              <div key={key}>
                <strong>{key}:</strong>
                <ul>
                  {value.map((item: any, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          }
        } else if (typeof value === 'object' && value !== null) {
          // Handle nested objects like contact
          return (
            <div key={key}>
              <h3>{key}:</h3>
              {Object.entries(value).map(([subKey, subValue]: [string, any]) => (
                <div key={subKey}>
                    <strong>{subKey}:</strong> {Array.isArray(subValue) ? (subValue as string[]).join(', ') : subValue}
                </div>
                ))}
            </div>
          );
        } else {
          return null;
        }
      })}
    </div>


    </div>
  );
};

export default UserText;