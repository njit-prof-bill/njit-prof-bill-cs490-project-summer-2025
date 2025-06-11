// components/ChatComponent.tsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
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
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Function to send message and store conversation
  const sendMessage = async (userMessage: string, customPrompt?: string) => {
    if (!user) {
      alert('Please log in to chat');
      return;
    }

    if (!userMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Call your API to get AI response
      console.log('Calling API...');
      const response = await fetch('/api/groq-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage, 
          prompt: customPrompt 
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      console.log('Got AI response:', data.response);

      // Step 2: Store conversation in Firebase
      // This works because we're on the client-side with authenticated user
      const conversationData = {
        userId: user.uid,
        userMessage: userMessage,
        systemPrompt: customPrompt || "You are a helpful resume building assistant. You will assist in receiving a resume, and extracting five categories of data which are: 1: Contact Info, 2: Career Objectives, 3: Skills, 4: Job History, 5: Education. Please return it in json format with each section named strictly named on these five titles.",
        aiResponse: data.response,
        model: data.metadata.model,
        timestamp: serverTimestamp(), // This works on client-side
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
        id: 'categoryData', // Use consistent ID since we're overwriting
        userMessage: userMessage,
        aiResponse: data.response,
        timestamp: new Date(),
        createdAt: new Date().toISOString()
      };

      setMessages([newMessage]); // Replace messages array with single message
      setMessage(''); // Clear input

      return {
        success: true,
        response: data.response,
        conversationId: 'categoryData'
      };

    } catch (error) {
      console.error('Error in sendMessage:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(message);
  };

  // Show loading state
  if (loading) return <div>Loading...</div>;
  
  // Show login prompt
  if (!user) return <div>Please log in to use the chat</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">AI Chat</h2>
      
      {/* Messages Display */}
      <div className="mb-4 space-y-4 max-h-96 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="border rounded p-3">
            <div className="font-semibold text-blue-600 mb-2">
              You: {msg.userMessage}
            </div>
            <div className="text-gray-700">
              AI: {msg.aiResponse}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {msg.createdAt}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded px-3 py-2"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </form>

      {/* Test Buttons */}
      <div className="mt-4 space-x-2">
        <button
          onClick={() => sendMessage("Hello, how are you today?")}
          disabled={isSubmitting}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Message
        </button>
        <button
          onClick={() => sendMessage("What's the weather like?", "You are a helpful weather assistant.")}
          disabled={isSubmitting}
          className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
        >
          Test with Custom Prompt
        </button>
      </div>
    </div>
  );
};