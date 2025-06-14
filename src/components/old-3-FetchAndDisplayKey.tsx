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

  const auth = getAuth();
  const firestore = getFirestore();

  const getNestedValue = (obj: any, path: string): any =>
    path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);

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

  // Helper to save data back to Firestore
  const saveData = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid || !editValue) return;

      const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`);
      await updateDoc(docRef, {
        [keyPath]: editValue,
      });
      setValue(editValue);
      setEditMode(false);
    } catch (err) {
      console.error('Save failed', err);
      setError('Failed to save data');
    }
  };

  // Helper to delete this key section
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

  // Toggle edit mode and prepare value for editing
  const startEditing = () => {
    setEditMode(true);
    setEditValue(value);
  };

  // Render nested data nicely
  const renderNested = (val: any) => {
    if (Array.isArray(val)) {
      return (
        <div style={{ border: '1px solid #ccc', padding: '0.5rem', marginBottom: '1rem' }}>
          <ul>
            {val.map((item, index) => (
              <li key={index}>{renderNested(item)}</li>
            ))}
          </ul>
        </div>
      );
    } else if (typeof val === 'object' && val !== null) {
      return (
        <pre style={{ padding: '0.5rem' }}>
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

  // Main render
  return (
    <div style={{ border: '1px solid #000', padding: '1rem', marginBottom: '1rem' }}>
      <h3>{keyPath}</h3>
      {editMode ? (
        // Editing state
        <div>
          {typeof editValue === 'string' ? (
            <textarea
              rows={4}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
          ) : (
            // For objects or arrays, serialize to JSON for editing
            <textarea
              rows={10}
              style={{ width: '100%', marginBottom: '0.5rem' }}
              value={JSON.stringify(editValue, null, 2)}
              onChange={(e) => {
                try {
                  setEditValue(JSON.parse(e.target.value));
                } catch {
                  // ignore parse errors during editing
                }
              }}
            />
          )}
          <button onClick={saveData} style={{ marginRight: '0.5rem' }}>Save</button>
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
          <button onClick={startEditing} style={{ marginRight: '0.5rem' }}>Edit</button>
          <button onClick={deleteSection}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default FetchAndDisplayKey;