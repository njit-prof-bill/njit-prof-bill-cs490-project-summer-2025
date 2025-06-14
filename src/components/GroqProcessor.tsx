import { auth, db } from '@/lib/firebase'; // Adjust path as needed
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';

interface GroqProcessorProps {}

export default function GroqProcessor({}: GroqProcessorProps) {
  // Internal configuration
  const sourceDocId = "documentText";
  const targetDocId = "categoryData";
  const textField = "text";
//   const prompt = "Please analyze the following text:";
  const prompt = `You are a helpful resume building assistant. You will assist in receiving user resume text, and filling in the json object format below with the user's extracted data. Striclty use the format provided in this prompt. Do not rearrange any of the json object. Do not include any extra comments, strictly return the json file. The fullname of a person is usually found in the first couple of lines. Do not forget to include the full name of a person in the output. Sometimes names may be ambiguos, like 'Laid-Off' or other non-name type words, include them if in the first line. Do not add any extra comments, return only the json object. "summary" should include any work history points or facts in it. Use This Example json object, and populate a similar json with the data from the input: { "fullName": "", "contact": { "email": "", "phone": "", "location": "" }, "summary": "successful, professional, with, etc, any work comments go here": [ { "jobTitle": "", "company": "", "startDate": "", "endDate": "", "responsibilities": [ "", "", "" ] }, { "jobTitle": "", "company": "", "startDate": "", "endDate": "", "responsibilities": [ "", "", "" ] } ], "education": [ { "degree": "", "institution": "", "startDate": "", "endDate": "", "gpa": "" } ], "skills": [ "", "", "", "", "", "" ] } Important: Do not call work items as 'achievements', call it 'responsibilities'. Follow the above example strictly. Experience should be 'workExperience' key. Reformat the json a second time before responding, double check the json. Do not say 'here is the json, or json or anything extra'.`;


  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const processDocument = async () => {
    if (!user) return;

    try {
      // 1. Retrieve document text field from /db/users/{uid}/userDocuments/documentText
      const sourceDocRef = doc(db, 'users', user.uid, 'userDocuments', sourceDocId);
      const sourceDoc = await getDoc(sourceDocRef);
      
      if (!sourceDoc.exists()) {
        console.error('Source document not found');
        return;
      }

      const textContent = sourceDoc.data()[textField];
      if (!textContent) {
        console.error('Text field not found in document');
        return;
      }

      // 2. Send to Groq via API route
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textContent,
          prompt: prompt
        }),
      });

      if (!response.ok) {
        console.error('Failed to call Groq API');
        return;
      }

      const { response: groqResponse } = await response.json();
      
      if (!groqResponse) {
        console.error('No response from Groq');
        return;
      }

      // 3. Store result in /db/users/{uid}/userDocuments/categoryData
      const targetDocRef = doc(db, 'users', user.uid, 'userDocuments', targetDocId);
      await setDoc(targetDocRef, {
        originalText: textContent,
        groqResponse: groqResponse,
        prompt: prompt,
        processedAt: new Date(),
        processedBy: user.uid
      });

      console.log('Document processed successfully');
      
    } catch (error) {
      console.error('Error processing document:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in to continue</div>;

  return (
    <div className="p-4">
        Extract Category details from resume from db. <br />
      <button 
        onClick={processDocument}
        className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
      >
        Process Document with Groq
      </button>
    </div>
  );
}