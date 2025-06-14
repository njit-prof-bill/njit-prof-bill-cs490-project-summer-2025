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

  const auth = getAuth();
  const firestore = getFirestore();





  
  const getNestedValue = (obj: any, path: string): any =>
    path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);

  // Fetch data initially
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

        const jsonString: string = data.groqResponse;
        let jsonObject;
        try {
          jsonObject = JSON.parse(jsonString);
        } catch {
          setError('Invalid JSON string in database');
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

  // Save only the JSON string, applying modifications
const saveJsonContent = async () => {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      setError('Document does not exist');
      return;
    }
    const data = docSnap.data();
    const currentJsonString: string = data.groqResponse;

    // Parse current JSON
    let jsonObject;
    try {
      jsonObject = JSON.parse(currentJsonString);
    } catch (err) {
      setError('Invalid JSON string in database');
      return;
    }

    // Update nested at keyPath
    const pathParts = keyPath.split('.');
    let target = jsonObject;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (target[pathParts[i]] === undefined || typeof target[pathParts[i]] !== 'object') {
        target[pathParts[i]] = {}; // create if missing
      }
      target = target[pathParts[i]];
    }
    target[pathParts[pathParts.length - 1]] = value; // assign the new value

    // Save back as string
    const newJsonStr = JSON.stringify(jsonObject);
    await updateDoc(docRef, { groqResponse: newJsonStr });
    setValue(value);
    setEditMode(false);
  } catch (err) {
    console.error('Error saving JSON string:', err);
    setError('Failed to save JSON string');
  }
};

  // Delete entire key section
  const deleteSection = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`);
      await updateDoc(docRef, {
        [keyPath]: deleteField(),
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
  };

  // Add new item logic (for arrays or objects)
  const addItem = async () => {
    if (!newItem.trim()) return;
    try {
      const uid = auth.currentUser?.uid;
      if (!uid || value === null) return;

      // Create updated value based on current type
      const updatedValue = (() => {
        if (Array.isArray(value)) {
          return [...value, newItem];
        } else if (typeof value === 'object' && value !== null) {
          const key = prompt('Enter new key name');
          if (!key || key.trim() === '') return value;
          return { ...value, [key.trim()]: newItem };
        } else if (typeof value === 'string') {
          return value + ' ' + newItem;
        }
        return value;
      })();

      // Fetch current JSON string, parse, update, save
      const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        setError('Document does not exist');
        return;
      }
      const data = docSnap.data();
      const currentJsonString: string = data.groqResponse;
      let jsonObject;
      try {
        jsonObject = JSON.parse(currentJsonString);
      } catch {
        setError('Invalid JSON string in database');
        return;
      }

      // Apply update
      const pathParts = keyPath.split('.');
      let target = jsonObject;
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (target[pathParts[i]] === undefined) target[pathParts[i]] = {};
        target = target[pathParts[i]];
      }
      target[pathParts[pathParts.length - 1]] = updatedValue;

      // Save back
      await updateDoc(docRef, { groqResponse: JSON.stringify(jsonObject) });
      setValue(updatedValue);
      setAdding(false);
      setNewItem('');
    } catch (err) {
      console.error('Add item failed', err);
      setError('Failed to add item');
    }
  };

  // Render nested data
  const renderNested = (val: any) => {
    if (Array.isArray(val)) {
      return (
        <div style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
          <ul>
            {val.map((item, index) => (
              <li key={index}>{renderNested(item)}</li>
            ))}
          </ul>
        </div>
      );
    } else if (typeof val === 'object' && val !== null) {
      return (
        <pre style={{  padding: '0.5rem' }}>
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    } else if (typeof val === 'string') {
      return <span>{val}</span>;
    } else {
      return <span>{String(val)}</span>;
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ border: '1px solid #000', padding: '1rem', marginBottom: '1rem' }}>
      <h3>{keyPath}</h3>

      {editMode ? (
        // Editing mode
        <div>
          {typeof editValue === 'string' ? (
            <textarea
              rows={4}
              style={{ width: '100%', marginBottom: '0.5rem' }}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          ) : (
            <textarea
              rows={10}
              style={{ width: '100%', marginBottom: '0.5rem' }}
              value={JSON.stringify(editValue, null, 2)}
              onChange={(e) => {
                try {
                  setEditValue(JSON.parse(e.target.value));
                } catch {
                  // ignore parse errors
                }
              }}
            />
          )}

             {/* Save Button */}
    <button onClick={saveJsonContent} style={{ marginRight: '0.5rem' }}>Save</button>
    {/* Cancel Button */}
    <button onClick={() => setEditMode(false)}>Cancel</button>

        </div>
      ) : (
        // Display mode
        <div>
          {value ? (
            renderNested(value)
          ) : (
            <p>No data available.</p>
          )}
          {/* Buttons to toggle edit mode or delete */}
    <button onClick={startEditing} style={{ marginRight: '0.5rem' }}>Edit</button>
    <button onClick={deleteSection}>Delete</button>

          {/* Add Item UI */}
          {adding ? (
            <div style={{ marginTop: '1rem' }}>
              <input
                type="text"
                placeholder="Enter new item"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                style={{ width: '80%', marginRight: '0.5rem' }}
              />
              <button onClick={addItem} style={{ marginRight: '0.5rem' }}>Add</button>
              <button onClick={() => { setAdding(false); setNewItem(''); }}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} style={{ marginTop: '1rem' }}>Add Item</button>
          )}
        </div>
      )}

      

    </div>

    
  );
};

export default FetchAndDisplayKey;