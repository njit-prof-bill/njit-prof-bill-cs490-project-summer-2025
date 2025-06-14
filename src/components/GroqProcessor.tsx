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
  
  const prompt = `You are a helpful resume building assistant. You will assist in receiving user resume text, and filling in the json object format below with the user's extracted data. Striclty use the format provided in this prompt. Do not rearrange any of the json object. Do not include any extra comments, strictly return the json file. The fullname of a person is usually found in the first couple of lines. Do not forget to include the full name of a person in the output. Sometimes names may be ambiguos, like 'Laid-Off' or other non-name type words, include them if in the first line. Do not add any extra comments, return only the json object. "summary" should include any work history points or facts in it. Use This Example json object, and populate a similar json with the data from the input: { "fullName": "", "contact": { "email": "", "phone": "", "location": "" }, "summary": "successful, professional, with, etc, any work comments go here": [ { "jobTitle": "", "company": "", "startDate": "", "endDate": "", "responsibilities": [ "", "", "" ] }, { "jobTitle": "", "company": "", "startDate": "", "endDate": "", "responsibilities": [ "", "", "" ] } ], "education": [ { "degree": "", "institution": "", "startDate": "", "endDate": "", "gpa": "" } ], "skills": [ "", "", "", "", "", "" ] } Important: Do not call work items as 'achievements', call it 'responsibilities'. Follow the above example strictly. Experience should be 'workExperience' key. Reformat the json a second time before responding, double check the json. Do not say 'here is the json, or json or anything extra'.`;

  const cleanupPrompt = `You are a JSON formatter and validator. Your task is to take the provided text and ensure it's properly formatted, valid JSON. Please:

1. Remove any extra text, comments, or explanations that aren't part of the JSON
2. Fix any JSON syntax errors (missing commas, brackets, quotes, etc.)
3. Ensure all strings are properly quoted
4. Validate that the JSON structure is correct
5. Return ONLY the cleaned, valid JSON - no additional text or explanations

The JSON should follow this exact structure:
{
  "fullName": "",
  "contact": {
    "email": "",
    "phone": "",
    "location": ""
  },
  "summary": "",
  "workExperience": [
    {
      "jobTitle": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": ["", "", ""]
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "startDate": "",
      "endDate": "",
      "gpa": ""
    }
  ],
  "skills": ["", "", "", "", "", ""]
}

Return only the valid JSON, nothing else.`;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const callGroqAPI = async (text: string, promptToUse: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          prompt: promptToUse
        }),
      });

      if (!response.ok) {
        console.error('Failed to call Groq API');
        return null;
      }

      const { response: groqResponse } = await response.json();
      return groqResponse || null;
    } catch (error) {
      console.error('Error calling Groq API:', error);
      return null;
    }
  };

  const validateJSON = (jsonString: string): { isValid: boolean; parsed?: any; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      return { isValid: true, parsed };
    } catch (error) {
      return { isValid: false, error: error instanceof Error ? error.message : 'Unknown JSON error' };
    }
  };

  const processDocument = async () => {
    if (!user) return;

    setProcessing(true);
    setStatus('Starting document processing...');

    try {
      // 1. Retrieve document text field from /db/users/{uid}/userDocuments/documentText
      setStatus('Retrieving source document...');
      const sourceDocRef = doc(db, 'users', user.uid, 'userDocuments', sourceDocId);
      const sourceDoc = await getDoc(sourceDocRef);
      
      if (!sourceDoc.exists()) {
        setStatus('Error: Source document not found');
        console.error('Source document not found');
        return;
      }

      const textContent = sourceDoc.data()[textField];
      if (!textContent) {
        setStatus('Error: Text field not found in document');
        console.error('Text field not found in document');
        return;
      }

      // 2. First Groq API call - Extract resume data
      setStatus('Processing resume with Groq (Step 1/2)...');
      const firstResponse = await callGroqAPI(textContent, prompt);
      
      if (!firstResponse) {
        setStatus('Error: No response from first Groq call');
        console.error('No response from first Groq call');
        return;
      }

      // 3. Validate the first response
      const firstValidation = validateJSON(firstResponse);
      let finalResponse = firstResponse;

      // 4. Second Groq API call - Clean up JSON if needed
      if (!firstValidation.isValid) {
        setStatus('Cleaning up JSON format (Step 2/2)...');
        console.log('First response needs cleanup:', firstValidation.error);
        
        const cleanedResponse = await callGroqAPI(firstResponse, cleanupPrompt);
        
        if (cleanedResponse) {
          const secondValidation = validateJSON(cleanedResponse);
          if (secondValidation.isValid) {
            finalResponse = cleanedResponse;
            setStatus('JSON successfully cleaned and validated');
          } else {
            setStatus('Warning: JSON cleanup failed, using original response');
            console.warn('Cleanup failed:', secondValidation.error);
          }
        } else {
          setStatus('Warning: Cleanup call failed, using original response');
          console.warn('Cleanup API call failed');
        }
      } else {
        setStatus('JSON was already valid, skipping cleanup');
      }

      // 5. Final validation check
      const finalValidation = validateJSON(finalResponse);

      // 6. Store result in /db/users/{uid}/userDocuments/categoryData
      setStatus('Saving processed data...');
      const targetDocRef = doc(db, 'users', user.uid, 'userDocuments', targetDocId);
      await setDoc(targetDocRef, {
        originalText: textContent,
        groqResponse: finalResponse,
        rawFirstResponse: firstResponse, // Keep the original for debugging
        prompt: prompt,
        cleanupPrompt: cleanupPrompt,
        isValidJSON: finalValidation.isValid,
        jsonError: finalValidation.error || null,
        processedAt: new Date(),
        processedBy: user.uid,
        processingSteps: {
          firstCallCompleted: true,
          cleanupCallCompleted: firstResponse !== finalResponse,
          finalValidation: finalValidation.isValid
        }
      });

      if (finalValidation.isValid) {
        setStatus('✅ Document processed successfully with valid JSON');
      } else {
        setStatus('⚠️ Document processed but JSON may have issues');
      }
      
      console.log('Document processed successfully');
      
    } catch (error) {
      setStatus('❌ Error processing document');
      console.error('Error processing document:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in to continue</div>;

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Resume Data Extractor</h3>
        <p className="text-gray-600 mb-4">
          Extract and format resume data from your uploaded document using AI processing with automatic JSON cleanup.
        </p>
      </div>
      
      {status && (
        <div className={`mb-4 p-3 rounded ${
          status.includes('Error') || status.includes('❌') 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : status.includes('Warning') || status.includes('⚠️')
            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
            : status.includes('✅')
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-blue-100 text-blue-700 border border-blue-300'
        }`}>
          {status}
        </div>
      )}
      
      <button 
        onClick={processDocument}
        disabled={processing}
        className={`px-6 py-3 rounded font-medium transition-colors ${
          processing 
            ? 'bg-gray-400 cursor-not-allowed text-gray-700' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {processing ? 'Processing...' : 'Process Document with Groq'}
      </button>
      
      {processing && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">This may take a moment...</p>
        </div>
      )}
    </div>
  );
}