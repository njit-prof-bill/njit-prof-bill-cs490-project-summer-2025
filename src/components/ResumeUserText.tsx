import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../lib/firebase'; // Adjust the import
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';



import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";








const ResumeUserText: React.FC = () => {
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
            const textStr = data.groqResponse; // assuming this is your JSON string

           


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


        <CardHeader>
            <CardTitle>User Details:</CardTitle>
        </CardHeader>
      <br />
      


      <h2>Name: {jsonObject?.fullName || 'N/A'}</h2>
      <h2>Contact:</h2>
      <h3>Email: {
        typeof jsonObject?.contact?.email === 'string' 
          ? jsonObject.contact.email 
          : jsonObject?.contact?.email?.primary || 'N/A'
      }</h3>

      <h3>Phone: {
        typeof jsonObject?.contact?.phone === 'string' 
          ? jsonObject.contact.phone 
          : jsonObject?.contact?.phone?.primary || 'N/A'
      }</h3>

      <h3>Location: {jsonObject?.contact?.location || 'N/A'}</h3>
      <h2>Summary: {jsonObject?.summary || 'N/A'}</h2>
      <h2>Work Experience: {jsonObject?.workExperience?.[0]?.jobTitle || 'N/A'}</h2>
      <h2>Company: {jsonObject?.workExperience?.[0]?.company || 'N/A'}</h2>

    </div>
  );
};

export default ResumeUserText;