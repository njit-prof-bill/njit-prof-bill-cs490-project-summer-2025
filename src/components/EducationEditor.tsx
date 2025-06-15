import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; // Adjust path to your Firebase config
import { User } from 'firebase/auth';
import { Save, Check, Plus, Edit2, Trash2 } from 'lucide-react';

interface EducationEditorProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface Education {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface GroqResponseData {
  education: Education[];
  [key: string]: any;
}

interface EducationFormProps {
  educationData: Education;
  onChange: (field: keyof Education, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  saveText: string;
}

// Move EducationForm outside the main component to prevent re-creation
const EducationForm: React.FC<EducationFormProps> = React.memo(({ 
  educationData, 
  onChange, 
  onSave, 
  onCancel, 
  title, 
  saveText 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent form submission on Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="p-4 bg-gray-700 rounded-md space-y-3">
      <h3 className="text-lg font-medium text-white mb-3">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Degree *</label>
          <input
            type="text"
            value={educationData.degree}
            onChange={(e) => onChange('degree', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., B.S., M.A., Ph.D."
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Institution *</label>
          <input
            type="text"
            value={educationData.institution}
            onChange={(e) => onChange('institution', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., University of Pittsburgh"
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Start Date</label>
          <input
            type="text"
            value={educationData.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., September 2008"
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">End Date</label>
          <input
            type="text"
            value={educationData.endDate}
            onChange={(e) => onChange('endDate', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., April 2012"
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-200">GPA</label>
          <input
            type="text"
            value={educationData.gpa}
            onChange={(e) => onChange('gpa', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., 3.8"
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!educationData.degree.trim() || !educationData.institution.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {saveText}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
});

EducationForm.displayName = 'EducationForm';

const EducationEditor: React.FC<EducationEditorProps> = ({ onSuccess, onError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingEducation, setEditingEducation] = useState<Education>({
    degree: '',
    institution: '',
    startDate: '',
    endDate: '',
    gpa: ''
  });
  const [newEducation, setNewEducation] = useState<Education>({
    degree: '',
    institution: '',
    startDate: '',
    endDate: '',
    gpa: ''
  });
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const docRef = currentUser ? doc(db, 'users', currentUser.uid, 'userDocuments', 'categoryData') : null;

  const loadEducation = useCallback(async () => {
    if (!docRef) return;
    
    setLoading(true);
    try {
      console.log('Loading education from:', docRef.path);
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
          console.log('Education found:', parsedResponse.education);
          
          const educationArray = parsedResponse.education || [];
          setEducation(educationArray);
          console.log('Education set to state:', educationArray);
        } else {
          console.log('No groqResponse field found');
          setEducation([]);
        }
      } else {
        console.log('Document does not exist');
        setEducation([]);
        onError?.('Document not found');
      }
    } catch (error) {
      console.error('Error loading education:', error);
      onError?.('Failed to load education: ' + (error as Error).message);
      setEducation([]);
    } finally {
      setLoading(false);
    }
  }, [docRef, onError]);

  const saveEducation = useCallback(async () => {
    if (!docRef) return;
    
    setSaving(true);
    try {
      // First, get the current document to preserve other data
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        onError?.('Document not found. Cannot save education.');
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

      // Update only the education array, preserving everything else
      parsedResponse.education = education;

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
      console.error('Error saving education:', error);
      onError?.('Failed to save education: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  }, [docRef, education, onError, onSuccess]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    // Reset any editing state
    setEditingIndex(null);
    setEditingEducation({
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
      gpa: ''
    });
    setNewEducation({
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
      gpa: ''
    });
    setShowAddForm(false);
    // Load the current education from Firestore
    loadEducation();
  }, [loadEducation]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setEditingIndex(null);
    setShowAddForm(false);
  }, []);

  const addEducation = useCallback(() => {
    if (newEducation.degree.trim() && newEducation.institution.trim()) {
      setEducation(prev => [...prev, { ...newEducation }]);
      setNewEducation({
        degree: '',
        institution: '',
        startDate: '',
        endDate: '',
        gpa: ''
      });
      setShowAddForm(false);
    }
  }, [newEducation]);

  const deleteEducation = useCallback((index: number) => {
    setEducation(prev => prev.filter((_, i) => i !== index));
  }, []);

  const startEditing = useCallback((index: number) => {
    setEditingIndex(index);
    setEditingEducation({ ...education[index] });
  }, [education]);

  const saveEdit = useCallback(() => {
    if (editingIndex !== null && editingEducation.degree.trim() && editingEducation.institution.trim()) {
      setEducation(prev => {
        const updatedEducation = [...prev];
        updatedEducation[editingIndex] = { ...editingEducation };
        return updatedEducation;
      });
      setEditingIndex(null);
      setEditingEducation({
        degree: '',
        institution: '',
        startDate: '',
        endDate: '',
        gpa: ''
      });
    }
  }, [editingIndex, editingEducation]);

  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditingEducation({
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
      gpa: ''
    });
  }, []);

  const handleNewEducationChange = useCallback((field: keyof Education, value: string) => {
    setNewEducation(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditingEducationChange = useCallback((field: keyof Education, value: string) => {
    setEditingEducation(prev => ({ ...prev, [field]: value }));
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
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Edit Education
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">Edit Education</h2>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Add new education button */}
              {!showAddForm && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Education
                  </button>
                </div>
              )}

              {/* Add new education form */}
              {showAddForm && (
                <div className="mb-6">
                  <EducationForm
                    educationData={newEducation}
                    onChange={handleNewEducationChange}
                    onSave={addEducation}
                    onCancel={() => setShowAddForm(false)}
                    title="Add New Education"
                    saveText="Add Education"
                  />
                </div>
              )}

              {/* Education list */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">
                  Current Education ({education.length})
                </label>
                
                {/* Debug info */}
                <div className="mb-2 text-xs text-gray-400">
                  Debug: Education array length = {education.length}
                </div>
                
                {education.length === 0 ? (
                  <div className="italic p-4 bg-gray-700 rounded-md text-gray-300">
                    No education records found. Check console for debugging info.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index} className="border border-gray-600 rounded-md">
                        {editingIndex === index ? (
                          <EducationForm
                            educationData={editingEducation}
                            onChange={handleEditingEducationChange}
                            onSave={saveEdit}
                            onCancel={cancelEdit}
                            title="Edit Education"
                            saveText="Save Changes"
                          />
                        ) : (
                          <div className="p-4 bg-gray-700 rounded-md">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-lg font-medium text-white">
                                  {edu.degree} - {edu.institution}
                                </h3>
                                <p className="text-gray-300">
                                  {edu.startDate} - {edu.endDate}
                                </p>
                                {edu.gpa && (
                                  <p className="text-gray-300">GPA: {edu.gpa}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditing(index)}
                                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteEducation(index)}
                                  className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-600 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-500 text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveEducation}
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




export default EducationEditor;