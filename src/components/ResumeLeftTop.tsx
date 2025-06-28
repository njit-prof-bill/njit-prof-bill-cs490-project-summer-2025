import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../lib/firebase'; // Adjust the import
import { onAuthStateChanged, User } from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import JobDescriptionUpload from '../components/JobDescriptionUpload'; // adjust the path if needed

const ResumeLeftTop: React.FC = () => {
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

 

  return (
    <div  style={{
        // backgroundColor: '#181818',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: 'inset 0 0 15px rgba(74, 74, 74, 0.6)',
      }}>





        <Card className="w-full max-w shadow-lg">

                <CardHeader>
                  <CardTitle>Paste Job Description</CardTitle>
                </CardHeader>

                <CardContent>
                  <JobDescriptionUpload />
                </CardContent>

                <CardFooter>
                    <CardDescription></CardDescription>
                </CardFooter>

            </Card>




     


    </div>
  );
};

export default ResumeLeftTop;