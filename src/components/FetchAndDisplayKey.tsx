import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Props {
  keyPath: string;
}

const FetchAndDisplayKey: React.FC<Props> = ({ keyPath }) => {
  const [value, setValue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<string>(''); // input for new item
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const auth = getAuth();
  const firestore = getFirestore();

  const getNestedValue = (obj: any, path: string): any =>
    path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);

  // Helper function to set nested value
  const setNestedValue = (obj: any, path: string, value: any): any => {
    const keys = path.split('.');
    const result = JSON.parse(JSON.stringify(obj)); // Deep clone
    
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    const lastKey = keys[keys.length - 1];
    if (value === null || value === undefined) {
      delete current[lastKey];
    } else {
      current[lastKey] = value;
    }
    
    return result;
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError('Document does not exist');
          setLoading(false);
          return;
        }

        const data = docSnap.data();

        // Parse JSON string
        const jsonString: string = data.groqResponse;
        let jsonObject;
        try {
          jsonObject = JSON.parse(jsonString);
        } catch (err) {
          setError('Invalid JSON string');
          setLoading(false);
          return;
        }

        const nestedValue = getNestedValue(jsonObject, keyPath);
        if (nestedValue !== undefined) {
          setValue(nestedValue);
        } else {
          setError(`Key path "${keyPath}" not found`);
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyPath, auth, firestore]);

  // Save updated data
  const saveData = async () => {
    try {
      setSaving(true);
      const uid = auth.currentUser?.uid;
      if (!uid || editValue === null) return;

      const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`);
      
      // First, get the current document to access the full JSON
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        setError('Document does not exist');
        return;
      }

      const data = docSnap.data();
      const jsonString: string = data.groqResponse;
      let jsonObject;
      
      try {
        jsonObject = JSON.parse(jsonString);
      } catch (err) {
        setError('Invalid JSON string in document');
        return;
      }

      // Update the nested value in the JSON object
      const updatedJsonObject = setNestedValue(jsonObject, keyPath, editValue);
      
      // Convert back to string and update the document
      const updatedJsonString = JSON.stringify(updatedJsonObject);
      
      await updateDoc(docRef, {
        groqResponse: updatedJsonString,
      });
      
      setValue(editValue);
      setEditMode(false);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Save failed', err);
      setError('Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  // Delete section
  const deleteSection = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`);
      
      // Get current document
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        setError('Document does not exist');
        return;
      }

      const data = docSnap.data();
      const jsonString: string = data.groqResponse;
      let jsonObject;
      
      try {
        jsonObject = JSON.parse(jsonString);
      } catch (err) {
        setError('Invalid JSON string in document');
        return;
      }

      // Remove the nested value from the JSON object
      const updatedJsonObject = setNestedValue(jsonObject, keyPath, undefined);
      
      // Convert back to string and update the document
      const updatedJsonString = JSON.stringify(updatedJsonObject);
      
      await updateDoc(docRef, {
        groqResponse: updatedJsonString,
      });
      
      setValue(null);
    } catch (err) {
      console.error('Delete failed', err);
      setError('Failed to delete');
    }
  };

  // Start editing
  const startEditing = () => {
    setEditMode(true);
    setEditValue(value);
    setHasUnsavedChanges(false);
  };

  // Handle edit value changes
  const handleEditValueChange = (newValue: any) => {
    setEditValue(newValue);
    setHasUnsavedChanges(JSON.stringify(newValue) !== JSON.stringify(value));
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditMode(false);
    setEditValue(null);
    setHasUnsavedChanges(false);
  };

  // Add new item
  const addItem = async () => {
    if (!newItem.trim()) return;
    try {
      const uid = auth.currentUser?.uid;
      if (!uid || value === null) return;

      const updatedValue = (() => {
        if (Array.isArray(value)) {
          return [...value, newItem];
        } else if (typeof value === 'object' && value !== null) {
          // For objects, add a new key-value pair
          const key = prompt('Enter new key name');
          if (!key || key.trim() === '') return value;
          return { ...value, [key.trim()]: newItem };
        } else if (typeof value === 'string') {
          // Append to string
          return value + ' ' + newItem;
        }
        return value;
      })();

      const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`);
      
      // Get current document
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        setError('Document does not exist');
        return;
      }

      const data = docSnap.data();
      const jsonString: string = data.groqResponse;
      let jsonObject;
      
      try {
        jsonObject = JSON.parse(jsonString);
      } catch (err) {
        setError('Invalid JSON string in document');
        return;
      }

      // Update the nested value in the JSON object
      const updatedJsonObject = setNestedValue(jsonObject, keyPath, updatedValue);
      
      // Convert back to string and update the document
      const updatedJsonString = JSON.stringify(updatedJsonObject);
      
      await updateDoc(docRef, {
        groqResponse: updatedJsonString,
      });
      
      setValue(updatedValue);
      setAdding(false);
      setNewItem('');
    } catch (err) {
      console.error('Add item failed', err);
      setError('Failed to add item');
    }
  };

  // Helper to render nested data
  const renderNested = (val: any) => {
    if (Array.isArray(val)) {
      return (
        <div style={{ 
          border: '1px solid #ccc', 
          padding: '0.5rem', 
          marginBottom: '1rem',
          maxWidth: '100%',
          overflow: 'auto'
        }}>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {val.map((item, index) => (
              <li key={index} style={{ marginBottom: '0.25rem' }}>
                {renderNested(item)}
              </li>
            ))}
          </ul>
        </div>
      );
    } else if (typeof val === 'object' && val !== null) {
      return (
        <pre style={{  
          padding: '0.5rem',
          margin: 0,
          maxWidth: '100%',
          overflow: 'auto',
          backgroundColor: '',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    } else if (typeof val === 'string') {
      return <span style={{ wordBreak: 'break-word' }}>{val}</span>;
    } else {
      return <span style={{ wordBreak: 'break-word' }}>{String(val)}</span>;
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Main render
  return (
    <div style={{ 
      border: '1px solid #000', 
      padding: '1rem', 
      marginBottom: '1rem',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '0.5rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '1.1rem',
          wordBreak: 'break-word',
          minWidth: 0,
          flex: '1 1 auto'
        }}>
          {keyPath}
        </h3>
        {hasUnsavedChanges && (
          <span style={{ 
            backgroundColor: '#fff3cd', 
            color: '#856404', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '4px', 
            fontSize: '0.875rem',
            border: '1px solid #ffeaa7',
            whiteSpace: 'nowrap'
          }}>
            ● Unsaved changes
          </span>
        )}
        {saving && (
          <span style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '4px', 
            fontSize: '0.875rem',
            border: '1px solid #c3e6cb',
            whiteSpace: 'nowrap'
          }}>
            Saving...
          </span>
        )}
      </div>
      
      {editMode ? (
        // Editing mode
        <div style={{ width: '100%' }}>
          {typeof editValue === 'string' ? (
            <textarea
              rows={4}
              style={{ 
                width: '100%', 
                marginBottom: '0.5rem',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'monospace'
              }}
              value={editValue}
              onChange={(e) => handleEditValueChange(e.target.value)}
            />
          ) : (
            <textarea
              rows={10}
              style={{ 
                width: '100%', 
                marginBottom: '0.5rem',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
              value={JSON.stringify(editValue, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleEditValueChange(parsed);
                } catch {
                  // ignore parse errors but still update the raw text
                  // for real-time editing experience
                }
              }}
            />
          )}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={saveData} 
              disabled={saving || !hasUnsavedChanges}
              style={{ 
                backgroundColor: hasUnsavedChanges ? '#007bff' : '#skyblue',
                color: 'white',
                opacity: saving || !hasUnsavedChanges ? 0.6 : 1,
                cursor: saving || !hasUnsavedChanges ? 'not-allowed' : 'pointer',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={cancelEditing}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'red',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // Display mode
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: '1rem', maxWidth: '100%', overflow: 'hidden' }}>
            {value ? (
              renderNested(value)
            ) : (
              <p>No data available.</p>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button 
              onClick={startEditing}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
            <button 
              onClick={deleteSection}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
            <button 
              onClick={() => setAdding(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Add Item
            </button>
          </div>
          
          {/* Add New Item */}
          {adding && (
            <div style={{ 
              marginTop: '1rem',
              padding: '1rem',
              // backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px'
            }}>
              {typeof value === 'string' ? (
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  style={{ 
                    width: '100%', 
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <input
                  type="text"
                  placeholder="Enter new item"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  style={{ 
                    width: '100%', 
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              )}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={addItem}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
                <button 
                  onClick={() => { setAdding(false); setNewItem(''); }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FetchAndDisplayKey;