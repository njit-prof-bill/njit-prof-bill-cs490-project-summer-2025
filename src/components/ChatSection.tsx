// components/ChatComponent.tsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

interface Message {
  id: string;
  userMessage: string;
  aiResponse: string;
  timestamp: any;
  createdAt: string;
}

export const ChatSection: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentText, setDocumentText] = useState('');
  const [fetchingDoc, setFetchingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Fetch user's document text when user is available
  useEffect(() => {
    if (user) {
      fetchUserDocument();
    }
  }, [user]);

  // Fetch system prompt from public folder
  useEffect(() => {
    fetchSystemPrompt();
  }, []);

  // Function to fetch system prompt from txt file
  const fetchSystemPrompt = async () => {
    setPromptLoading(true);
    setPromptError(null);
    
    try {

      const response = await fetch('/prompts/extract-data-prompt-1.txt');
      if (!response.ok) {
        throw new Error(`Failed to fetch prompt: ${response.status}`);
      }
      const promptText = await response.text();
      // setSystemPrompt(promptText.trim());


    } catch (error) {
      console.log("Got alt prompt....")
      console.error('Error fetching prompt:', error);
      setPromptError('Failed to load system prompt');
      // Fallback to default prompt   
      
      // setSystemPrompt("You are a helpful resume building assistant.\nYou will assist in receiving user resume text, and filling in the json\nobject format below with the user's extracted data. \nStriclty use the format provided in this prompt.\nDo not rearrange any of the json object.\nDo not include any extra comments, strictly return the json file. The fullname of a person\nis usually found in the first couple of lines.\nDo not forget to include the full name of a person in the output.\n\nUse This Example json object, and populate a similar json with the data from the input:\n\n```json\n{\n  \"fullName\": \"\",\n  \"contact\": {\n    \"email\": \"\",\n    \"phone\": \"\",\n    \"location\": \"\"\n  },\n  \"summary\": \"\": [\n    {\n      \"jobTitle\": \"\",\n      \"company\": \"\",\n      \"startDate\": \"\",\n      \"endDate\": \"\",\n      \"responsibilities\": [\n        \"\",\n        \"\",\n        \"\"\n      ]\n    },\n    {\n      \"jobTitle\": \"\",\n      \"company\": \"\",\n      \"startDate\": \"\",\n      \"endDate\": \"\",\n      \"responsibilities\": [\n        \"\",\n        \"\",\n        \"\"\n      ]\n    }\n  ],\n  \"education\": [\n    {\n      \"degree\": \"\",\n      \"institution\": \"\",\n      \"startDate\": \"\",\n      \"endDate\": \"\",\n      \"gpa\": \"\"\n    }\n  ],\n  \"skills\": [\n    \"\",\n    \"\",\n    \"\",\n    \"\",\n    \"\",\n    \"\"\n  ]\n}\n```\n\nImportant: Do not call work items as 'achievements', call it 'responsibilities'. Follow the above example strictly.");
      



    } finally {
      setPromptLoading(false);
    }
  };





  // Function to fetch text from user's Firebase document
  const fetchUserDocument = async () => {
    if (!user) return;
    
    setFetchingDoc(true);
    setDocError(null);
    
    try {
      // Adjust this path to match where your text document is stored
      // Example: fetching from users/{uid}/documents/resumeText
      const userDocRef = doc(db, 'users', user.uid, 'userDocuments', 'documentText');
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        // Adjust 'content' to match your document field name
        const textContent = userData.rawResumeText || '';
        setDocumentText(textContent);
        
        if (!textContent) {
          setDocError('Document exists but contains no text content');
        }
      } else {
        setDocError('No document found. Please upload your resume first.');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      setDocError('Error fetching document. Please try again.');
    } finally {
      setFetchingDoc(false);
    }
  };

  // Function to send message using document text and store conversation
  const processDocumentWithAI = async (customPrompt?: string) => {
    if (!user) {
      alert('Please log in to process document');
      return;
    }

    if (!documentText.trim()) {
      alert('No text found in your document. Please upload a document first.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Call your API to get AI response using document text
      console.log('Processing document with AI...');
      const response = await fetch('/api/groq-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: documentText, // Use document text instead of user input
          prompt: customPrompt 
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      console.log('Got AI response:', data.response);

      // Step 2: Store conversation in Firebase
      const conversationData = {
        userId: user.uid,
        userMessage: documentText, // Store the document text as the "user message"
        systemPrompt: customPrompt || systemPrompt,
        aiResponse: data.response,
        model: data.metadata.model,
        timestamp: serverTimestamp(),
        groqId: data.metadata.groqId,
        usage: data.metadata.usage,
        createdAt: new Date().toISOString(),
      };

      // Store in a single document called "categoryData"
      const categoryDataRef = doc(db, 'users', user.uid, 'userDocuments', 'categoryData');
      
      // Overwrite the document (or create if it doesn't exist)
      await setDoc(categoryDataRef, conversationData);
      console.log('Stored in Firebase at:', categoryDataRef.path);

      // Update local state to show the message immediately
      const newMessage: Message = {
        id: 'categoryData',
        userMessage: 'Document processed', // Display friendly message instead of full document text
        aiResponse: data.response,
        timestamp: new Date(),
        createdAt: new Date().toISOString()
      };

      setMessages([newMessage]);

      return {
        success: true,
        response: data.response,
        conversationId: 'categoryData'
      };

    } catch (error) {
      console.error('Error in processDocumentWithAI:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading) return <div>Loading...</div>;
  
  // Show login prompt
  if (!user) return <div>Please log in to use the chat</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">AI Document Processor</h2>
      
      {/* System Prompt Status */}
      <div className="mb-4 p-3 border rounded ">
        <h3 className="font-semibold mb-2">System Prompt:</h3>
        {promptLoading && <p className="text-blue-600">Loading prompt...</p>}
        {promptError && <p className="text-red-600">{promptError}</p>}
        {systemPrompt && !promptLoading && (
          <div>
            <p className="text-green-600 mb-2">✓ Prompt loaded successfully</p>
            <div className="bg-white p-2 rounded max-h-24 overflow-y-auto">
              <p className="text-sm text-gray-700">
                {systemPrompt.substring(0, 150)}...
              </p>
            </div>
          </div>
        )}
        <button
          onClick={fetchSystemPrompt}
          disabled={promptLoading}
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          {promptLoading ? 'Refreshing...' : 'Refresh Prompt'}
        </button>
      </div>

      {/* Document Status */}
      <div className="mb-4 p-3 border rounded">
        <h3 className="font-semibold mb-2">Document Status:</h3>
        {fetchingDoc && <p className="text-blue-600">Loading document...</p>}
        {docError && <p className="text-red-600">{docError}</p>}
        {documentText && !fetchingDoc && (
          <div>
            <p className="text-green-600 mb-2">✓ Document loaded successfully</p>
            <div className="bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-700">
                Preview: {documentText.substring(0, 200)}...
              </p>
            </div>
          </div>
        )}
        <button
          onClick={fetchUserDocument}
          disabled={fetchingDoc}
          className="mt-2 bg-gray-500 text-white px-3 py-1 rounded text-sm"
        >
          {fetchingDoc ? 'Refreshing...' : 'Refresh Document'}
        </button>
      </div>

      {/* Messages Display */}
      <div className="mb-4 space-y-4 max-h-96 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="border rounded p-3">
            <div className="font-semibold text-blue-600 mb-2">
              Input: {msg.userMessage}
            </div>
            <div className="text-gray-700">
              AI Response: {msg.aiResponse}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {msg.createdAt}
            </div>
          </div>
        ))}
      </div>

      {/* Process Document Button */}
      <div className="mb-4">
        <button
          onClick={() => processDocumentWithAI()}
          disabled={isSubmitting || !documentText || fetchingDoc}
          className="w-full bg-blue-500 text-white px-4 py-3 rounded disabled:opacity-50 font-semibold"
        >
          {isSubmitting ? 'Processing Document...' : 'Process Document with AI'}
        </button>
      </div>

      {/* Test Buttons */}
      <div className="mt-4 space-x-2">
        <button
          onClick={() => processDocumentWithAI("You are a helpful resume building assistant. Extract and categorize the resume information.")}
          disabled={isSubmitting || !documentText}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Extract Resume Categories
        </button>
        <button
          onClick={() => processDocumentWithAI("You are a career counselor. Analyze this resume and provide improvement suggestions.")}
          disabled={isSubmitting || !documentText}
          className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
        >
          Get Resume Feedback
        </button>
      </div>
    </div>
  );
};