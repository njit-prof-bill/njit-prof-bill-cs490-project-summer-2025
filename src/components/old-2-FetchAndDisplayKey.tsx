import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Props {
  keyPath: string;
}

const FetchAndDisplayKey: React.FC<Props> = ({ keyPath }) => {
  const [value, setValue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const firestore = getFirestore();

  const getNestedValue = (obj: any, path: string): any =>
    path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Helper to render various data types
  const renderValue = (val: any) => {
    if (Array.isArray(val)) {
      // Render array items
      return (
        <div>
          <strong>{keyPath} (Total {val.length} items):</strong>
          <ul>
            {val.map((item, index) => (
              <li key={index}>{renderValue(item)}</li>
            ))}
          </ul>
        </div>
      );
    } else if (typeof val === 'string') {
      // If string, check if it looks like JSON
      // For simplicity, just render as text
      return <span>{val}</span>;
    } else if (val && typeof val === 'object') {
      // Render object as JSON string or formatted list
      return (
        <pre>{JSON.stringify(val, null, 2)}</pre>
      );
    } else {
      // fallback for other types
      return <span>{String(val)}</span>;
    }
  };

  // Render based on type
  if (Array.isArray(value) || typeof value === 'string' || (value && typeof value === 'object')) {
    return <div>{renderValue(value)}</div>;
  }

  // Fallback for other types
  return <div>{String(value)}</div>;
};

export default FetchAndDisplayKey;