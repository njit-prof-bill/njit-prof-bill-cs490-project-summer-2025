import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; // Adjust path to your Firebase config
import { User } from 'firebase/auth';
import { Save, Check, Plus, Edit2, Trash2 } from 'lucide-react';

interface WorkExperienceEditorProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface WorkExperience {
  jobTitle: string;
  jobDesc: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

interface GroqResponseData {
  workExperience: WorkExperience[];
  [key: string]: any;
}

interface WorkExperienceFormProps {
  workExperienceData: WorkExperience;
  onChange: (field: keyof WorkExperience, value: string | string[]) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  saveText: string;
}

// Move WorkExperienceForm outside the main component to prevent re-creation
const WorkExperienceForm: React.FC<WorkExperienceFormProps> = React.memo(({ 
  workExperienceData, 
  onChange, 
  onSave, 
  onCancel, 
  title, 
  saveText 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent form submission on Enter key for input fields
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  };

  return (
    <div className="p-4 bg-gray-700 rounded-md space-y-3">
      <h3 className="text-lg font-medium text-white mb-3">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Job Title *</label>
          <input
            type="text"
            value={workExperienceData.jobTitle}
            onChange={(e) => onChange('jobTitle', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Software Engineer"
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Company *</label>
          <input
            type="text"
            value={workExperienceData.company}
            onChange={(e) => onChange('company', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Google Inc."
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Location</label>
          <input
            type="text"
            value={workExperienceData.location}
            onChange={(e) => onChange('location', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., San Francisco, CA"
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">Start Date</label>
            <input
              type="text"
              value={workExperienceData.startDate}
              onChange={(e) => onChange('startDate', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Jan 2020"
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">End Date</label>
            <input
              type="text"
              value={workExperienceData.endDate}
              onChange={(e) => onChange('endDate', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Present"
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-200">Job Description</label>
          <textarea
            value={workExperienceData.jobDesc}
            onChange={(e) => onChange('jobDesc', e.target.value)}
            placeholder="Brief description of the role and main focus..."
            rows={3}
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-200">Responsibilities</label>
          <textarea
            value={Array.isArray(workExperienceData.responsibilities) ? workExperienceData.responsibilities.join('\n') : ''}
            onChange={(e) => {
              const responsibilities = e.target.value.split('\n').filter(r => r.trim() !== '');
              onChange('responsibilities', responsibilities);
            }}
            placeholder="Enter each responsibility on a new line..."
            rows={4}
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
          <p className="text-xs text-gray-400 mt-1">Enter each responsibility on a separate line</p>
        </div>
      </div>
      
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!workExperienceData.jobTitle.trim() || !workExperienceData.company.trim()}
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

WorkExperienceForm.displayName = 'WorkExperienceForm';

const WorkExperienceEditor: React.FC<WorkExperienceEditorProps> = ({ onSuccess, onError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingWorkExperience, setEditingWorkExperience] = useState<WorkExperience>({
    jobTitle: '',
    jobDesc: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    responsibilities: []
  });
  const [newWorkExperience, setNewWorkExperience] = useState<WorkExperience>({
    jobTitle: '',
    jobDesc: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    responsibilities: []
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

  const loadWorkExperience = useCallback(async () => {
    if (!docRef) return;
    
    setLoading(true);
    try {
      console.log('Loading work experience from:', docRef.path);
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
          console.log('Work experience found:', parsedResponse.workExperience);
          
          const workExperienceArray = parsedResponse.workExperience || [];
          setWorkExperience(workExperienceArray);
          console.log('Work experience set to state:', workExperienceArray);
        } else {
          console.log('No groqResponse field found');
          setWorkExperience([]);
        }
      } else {
        console.log('Document does not exist');
        setWorkExperience([]);
        onError?.('Document not found');
      }
    } catch (error) {
      console.error('Error loading work experience:', error);
      onError?.('Failed to load work experience: ' + (error as Error).message);
      setWorkExperience([]);
    } finally {
      setLoading(false);
    }
  }, [docRef, onError]);

  const saveWorkExperience = useCallback(async () => {
    if (!docRef) return;
    
    setSaving(true);
    try {
      // First, get the current document to preserve other data
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        onError?.('Document not found. Cannot save work experience.');
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

      // Update only the workExperience array, preserving everything else
      parsedResponse.workExperience = workExperience;

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
      console.error('Error saving work experience:', error);
      onError?.('Failed to save work experience: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  }, [docRef, workExperience, onError, onSuccess]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    // Reset any editing state
    setEditingIndex(null);
    setEditingWorkExperience({
      jobTitle: '',
      jobDesc: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      responsibilities: []
    });
    setNewWorkExperience({
      jobTitle: '',
      jobDesc: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      responsibilities: []
    });
    setShowAddForm(false);
    // Load the current work experience from Firestore
    loadWorkExperience();
  }, [loadWorkExperience]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setEditingIndex(null);
    setShowAddForm(false);
  }, []);

  const addWorkExperience = useCallback(() => {
    if (newWorkExperience.jobTitle.trim() && newWorkExperience.company.trim()) {
      setWorkExperience(prev => [...prev, { ...newWorkExperience }]);
      setNewWorkExperience({
        jobTitle: '',
        jobDesc: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        responsibilities: []
      });
      setShowAddForm(false);
    }
  }, [newWorkExperience]);

  const deleteWorkExperience = useCallback((index: number) => {
    setWorkExperience(prev => prev.filter((_, i) => i !== index));
  }, []);

  const startEditing = useCallback((index: number) => {
    setEditingIndex(index);
    setEditingWorkExperience({ ...workExperience[index] });
  }, [workExperience]);

  const saveEdit = useCallback(() => {
    if (editingIndex !== null && editingWorkExperience.jobTitle.trim() && editingWorkExperience.company.trim()) {
      setWorkExperience(prev => {
        const updatedWorkExperience = [...prev];
        updatedWorkExperience[editingIndex] = { ...editingWorkExperience };
        return updatedWorkExperience;
      });
      setEditingIndex(null);
      setEditingWorkExperience({
        jobTitle: '',
        jobDesc: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        responsibilities: []
      });
    }
  }, [editingIndex, editingWorkExperience]);

  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditingWorkExperience({
      jobTitle: '',
      jobDesc: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      responsibilities: []
    });
  }, []);

  const handleNewWorkExperienceChange = useCallback((field: keyof WorkExperience, value: string | string[]) => {
    setNewWorkExperience(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditingWorkExperienceChange = useCallback((field: keyof WorkExperience, value: string | string[]) => {
    setEditingWorkExperience(prev => ({ ...prev, [field]: value }));
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
        Edit Work Experience
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">Edit Work Experience</h2>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Add new work experience button */}
              {!showAddForm && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Work Experience
                  </button>
                </div>
              )}

              {/* Add new work experience form */}
              {showAddForm && (
                <div className="mb-6">
                  <WorkExperienceForm
                    workExperienceData={newWorkExperience}
                    onChange={handleNewWorkExperienceChange}
                    onSave={addWorkExperience}
                    onCancel={() => setShowAddForm(false)}
                    title="Add New Work Experience"
                    saveText="Add Work Experience"
                  />
                </div>
              )}

              {/* Work experience list */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">
                  Current Work Experience ({workExperience.length})
                </label>
                
                {/* Debug info */}
                <div className="mb-2 text-xs text-gray-400">
                  Debug: Work experience array length = {workExperience.length}
                </div>
                
                {workExperience.length === 0 ? (
                  <div className="italic p-4 bg-gray-700 rounded-md text-gray-300">
                    No work experience records found. Check console for debugging info.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workExperience.map((exp, index) => (
                      <div key={index} className="border border-gray-600 rounded-md">
                        {editingIndex === index ? (
                          <WorkExperienceForm
                            workExperienceData={editingWorkExperience}
                            onChange={handleEditingWorkExperienceChange}
                            onSave={saveEdit}
                            onCancel={cancelEdit}
                            title="Edit Work Experience"
                            saveText="Save Changes"
                          />
                        ) : (
                          <div className="p-4 bg-gray-700 rounded-md">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3 className="text-lg font-medium text-white">
                                  {exp.jobTitle} - {exp.company}
                                </h3>
                                {exp.location && (
                                  <p className="text-gray-300">{exp.location}</p>
                                )}
                                <p className="text-gray-300">
                                  {exp.startDate} - {exp.endDate}
                                </p>
                                {exp.jobDesc && (
                                  <p className="text-gray-300 mt-2 text-sm">
                                    <strong>Description:</strong> {exp.jobDesc}
                                  </p>
                                )}
                                {exp.responsibilities && exp.responsibilities.length > 0 && (
                                  <div className="text-gray-300 mt-2 text-sm">
                                    <strong>Responsibilities:</strong>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                      {exp.responsibilities.map((resp, respIndex) => (
                                        <li key={respIndex}>{resp}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  type="button"
                                  onClick={() => startEditing(index)}
                                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteWorkExperience(index)}
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
            onClick={saveWorkExperience}
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

export default WorkExperienceEditor;