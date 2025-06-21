import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; // Adjust path to your Firebase config
import { User } from 'firebase/auth';
import { Save, Check } from 'lucide-react';

interface SkillsEditorProps {
  deduplicateSkills?: (skills: string[]) => string[]; // updated for dupe check
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface GroqResponseData {
  skills: string[];
  [key: string]: any;
}

  const SkillsEditor: React.FC<SkillsEditorProps> = ({ deduplicateSkills, onSuccess, onError }) => { //updated for dupe check
  const [isOpen, setIsOpen] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const docRef = currentUser ? doc(db, 'users', currentUser.uid, 'userDocuments', 'categoryData') : null;

  const loadSkills = async () => {
    if (!docRef) return;
    
    setLoading(true);
    try {
      console.log('Loading skills from:', docRef.path);
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
          console.log('Skills found:', parsedResponse.skills);
          
          const skillsArray = parsedResponse.skills || [];
          setSkills(skillsArray);
          console.log('Skills set to state:', skillsArray);
        } else {
          console.log('No groqResponse field found');
          setSkills([]);
        }
      } else {
        console.log('Document does not exist');
        setSkills([]);
        onError?.('Document not found');
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      onError?.('Failed to load skills: ' + (error as Error).message);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const saveSkills = async () => {
    if (!docRef) return;
    
    setSaving(true);
    try {
      // First, get the current document to preserve other data
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        onError?.('Document not found. Cannot save skills.');
        return;
      }
      
      const data = docSnap.data();
      const currentGroqResponse = data.groqResponse;
      
      if (!currentGroqResponse) {
        onError?.('No groqResponse field found in document.');
        return;
      }
      
      let parsedResponse: GroqResponseData;
      if (typeof currentGroqResponse === 'string') {
        parsedResponse = JSON.parse(currentGroqResponse);
      } else {
        parsedResponse = currentGroqResponse;
      }

      // Update only the skills array, preserving everything else
      parsedResponse.skills = deduplicateSkills ? deduplicateSkills(skills) : skills; // updated for dupe check

      // Save back in the same format it was stored
      const updatedGroqResponse = typeof currentGroqResponse === 'string' 
        ? JSON.stringify(parsedResponse)
        : parsedResponse;

      await updateDoc(docRef, {
        groqResponse: updatedGroqResponse
      });

      onSuccess?.();
      setIsOpen(false);
      
      // Refresh the page after successful save
      window.location.reload();
    } catch (error) {
      console.error('Error saving skills:', error);
      onError?.('Failed to save skills: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Reset any editing state
    setEditingIndex(null);
    setEditingValue('');
    setNewSkill('');
    // Load the current skills from Firestore
    loadSkills();
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingIndex(null);
    setEditingValue('');
    setNewSkill('');
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const deleteSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(skills[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const updatedSkills = [...skills];
      updatedSkills[editingIndex] = editingValue.trim();
      setSkills(updatedSkills);
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter') {
      if (action === 'add') {
        addSkill();
      } else {
        saveEdit();
      }
    }
  };

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
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Edit Skills
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">Edit Skills</h2>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <>
              {/* Add new skill */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-200">
                  Add New Skill
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'add')}
                    placeholder="Enter a new skill..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addSkill}
                    disabled={!newSkill.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Skills list */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">
                  Current Skills ({skills.length})
                </label>
                
                {/* Debug info */}
                <div className="mb-2 text-xs text-gray-400">
                  Debug: Skills array length = {skills.length}
                </div>
                
                {skills.length === 0 ? (
                  <div className="italic p-4 bg-gray-700 rounded-md text-gray-300">
                    No skills found. Check console for debugging info.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gray-700 rounded-md"
                      >
                        {editingIndex === index ? (
                          <>
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyPress={(e) => handleKeyPress(e, 'edit')}
                              className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              autoFocus
                            />
                            <button
                              onClick={saveEdit}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-gray-100">{skill}</span>
                            <button
                              onClick={() => startEditing(index)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteSkill(index)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-600 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-500 text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveSkills}
            disabled={saving || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <Save className="h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsEditor;