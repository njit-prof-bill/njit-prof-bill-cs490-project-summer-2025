import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Props {
  keyPath: string; // e.g., 'workExperience.0.jobTitle'
  label?: string;  // optional label for display
}

const FetchAndDisplayKey: React.FC<Props> = ({ keyPath, label }) => {
  const [value, setValue] = useState<any>(null);
  const [originalValue, setOriginalValue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState<any>(null);

  const auth = getAuth();
  const firestore = getFirestore();

  const getNestedValue = (obj: any, path: string): any =>
    path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);

  const setNestedValue = (obj: any, path: string, value: any): any => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const newObj = { ...obj };
    let current = newObj;
    for (const key of keys) {
      current[key] = { ...current[key] }; // clone nested object
      current = current[key];
    }
    current[lastKey] = value;
    return newObj;
  };

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
        } catch (err) {
          setError('Invalid JSON string');
          setLoading(false);
          return;
        }

        const nestedVal = getNestedValue(jsonObject, keyPath);
        setValue(nestedVal);
        setOriginalValue(nestedVal);
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyPath, auth, firestore]);

  const handleEdit = () => {
    setIsEditing(true);
    setNewValue(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewValue(e.target.value);
  };

  const handleSave = async () => {
    if (newValue === null) return;
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setError('User not authenticated');
        return;
      }

      const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`);
      // Fetch current doc to update the nested key
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
        setError('Invalid JSON string');
        return;
      }

      // Update nested value
      const updatedObject = setNestedValue(jsonObject, keyPath, newValue);

      // Save updated JSON string back
      await updateDoc(docRef, {
        groqResponse: JSON.stringify(updatedObject),
      });

      setValue(newValue);
      setIsEditing(false);
    } catch (err) {
      setError('Error updating data');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewValue(value);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {label && <strong>{label}:</strong>}
      {isEditing ? (
        <div>
          <input type="text" value={newValue} onChange={handleChange} />
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      ) : (
        <div>
          {String(value)}
          <button onClick={handleEdit}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default FetchAndDisplayKey;