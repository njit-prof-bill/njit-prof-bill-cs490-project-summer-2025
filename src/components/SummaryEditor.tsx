import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; // Adjust path to your Firebase config
import { User } from 'firebase/auth';
import { Save, Edit2 } from 'lucide-react';

interface SummaryEditorProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface GroqResponseData {
  summary: string;
  [key: string]: any;
}

interface SummaryFormProps {
  summaryData: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  saveText: string;
  saving?: boolean;
}

// Move SummaryForm outside the main component to prevent re-creation
const SummaryForm: React.FC<SummaryFormProps> = React.memo(({ 
  summaryData, 
  onChange, 
  onSave, 
  onCancel, 
  title, 
  saveText,
  saving = false
}) => {
  return (
    <div className="p-4 bg-gray-700 rounded-md space-y-3">
      <h3 className="text-lg font-medium text-white mb-3">{title}</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-200">Summary</label>
        <textarea
          value={summaryData}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          placeholder="Enter your professional summary here..."
          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={saving}
        />
      </div>
      
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {saveText}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
});

SummaryForm.displayName = 'SummaryForm';

const SummaryEditor: React.FC<SummaryEditorProps> = ({ onSuccess, onError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [editingSummary, setEditingSummary] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const docRef = currentUser ? doc(db, 'users', currentUser.uid, 'userDocuments', 'categoryData') : null;

  const loadSummary = useCallback(async () => {
    if (!docRef) return;
    
    setLoading(true);
    try {
      console.log('Loading summary from:', docRef.path);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Document data:', data);
        
        const groqResponse = data.groqResponse;
        console.log('groqResponse field:', groqResponse);
        
        if (groqResponse) {
          let parsedResponse: GroqResponseData;
          
          if (typeof groqResponse === 'string') {
            console.log('Parsing string groqResponse');
            parsedResponse = JSON.parse(groqResponse);
          } else {
            console.log('Using object groqResponse');
            parsedResponse = groqResponse;
          }
          
          console.log('Parsed response:', parsedResponse);
          console.log('Summary found:', parsedResponse.summary);
          
          const summaryText = parsedResponse.summary || '';
          setSummary(summaryText);
          console.log('Summary set to state:', summaryText);
        } else {
          console.log('No groqResponse field found');
          setSummary('');
        }
      } else {
        console.log('Document does not exist');
        setSummary('');
        onError?.('Document not found');
      }
    } catch (error) {
      console.error('Error loading summary:', error);
      onError?.('Failed to load summary: ' + (error as Error).message);
      setSummary('');
    } finally {
      setLoading(false);
    }
  }, [docRef, onError]);

  // Modified saveSummary to accept summaryText parameter for immediate save
  const saveSummary = useCallback(async (summaryText?: string) => {
    if (!docRef) return;
    
    const textToSave = summaryText !== undefined ? summaryText : summary;
    
    setSaving(true);
    try {
      // First, get the current document to preserve other data
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        onError?.('Document not found. Cannot save summary.');
        return;
      }
      
      const data = docSnap.data();
      const currentGroqResponse = data.groqResponse;
      
      let parsedResponse: GroqResponseData;
      
      if (currentGroqResponse) {
        if (typeof currentGroqResponse === 'string') {
          parsedResponse = JSON.parse(currentGroqResponse);
        } else {
          parsedResponse = currentGroqResponse;
        }
      } else {
        // If no groqResponse exists, create a new one
        parsedResponse = { summary: '' };
      }

      // Update only the summary, preserving everything else
      parsedResponse.summary = textToSave;

      // Save back in the same format it was stored (or as string if new)
      const updatedGroqResponse = typeof currentGroqResponse === 'string' || !currentGroqResponse
        ? JSON.stringify(parsedResponse)
        : parsedResponse;

      await updateDoc(docRef, {
        groqResponse: updatedGroqResponse
      });

      // Update local state with saved text
      setSummary(textToSave);
      
      onSuccess?.();
      setIsOpen(false);
      setIsEditing(false);
      
      // Refresh the page after successful save
      window.location.reload();
    } catch (error) {
      console.error('Error saving summary:', error);
      onError?.('Failed to save summary: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  }, [docRef, summary, onError, onSuccess]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setIsEditing(false);
    setEditingSummary('');
    // Load the current summary from Firestore
    loadSummary();
  }, [loadSummary]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsEditing(false);
    setEditingSummary('');
  }, []);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setEditingSummary(summary);
  }, [summary]);

  // Modified saveEdit to save directly to database
  const saveEdit = useCallback(async () => {
    // Save directly to database instead of just local state
    await saveSummary(editingSummary);
    // Note: The saveSummary function will handle state updates and closing
  }, [editingSummary, saveSummary]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditingSummary('');
  }, []);

  const handleEditingSummaryChange = useCallback((value: string) => {
    setEditingSummary(value);
  }, []);

  // Show loading or auth required state
  if (authLoading) {
    return (
      <button disabled className="bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
        Loading...
      </button>
    );
  }

  if (!currentUser) {
    return (
      <button disabled className="bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
        Sign in required
      </button>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"

      >
        Edit Summary
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">Edit Summary</h2>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <div>
              {/* Edit button */}
              {!isEditing && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={startEditing}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Summary
                  </button>
                </div>
              )}

              {/* Edit form */}
              {isEditing && (
                <div className="mb-6">
                  <div className="p-4 bg-gray-700 rounded-md space-y-3">
                    <h3 className="text-lg font-medium text-white mb-3">Edit Summary</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-200">Summary</label>
                      <textarea
                        value={editingSummary}
                        onChange={(e) => handleEditingSummaryChange(e.target.value)}
                        rows={12}
                        placeholder="Enter your professional summary here..."
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Current summary display */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">
                  Current Summary
                </label>
                
                {/* Debug info */}
                <div className="mb-2 text-xs text-gray-400">
                  Debug: Summary length = {summary.length}
                </div>
                
                {!summary ? (
                  <div className="italic p-4 bg-gray-700 rounded-md text-gray-300">
                    No summary found. Click "Edit Summary" to add one.
                  </div>
                ) : (
                  <div className="p-4 bg-gray-700 rounded-md">
                    <div className="text-white whitespace-pre-wrap leading-relaxed">
                      {summary}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-600 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-500 text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Close
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={saveEdit}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryEditor;