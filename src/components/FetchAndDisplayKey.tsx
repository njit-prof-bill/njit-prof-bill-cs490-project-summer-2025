import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Props {
  keyPath: string; // e.g., 'workExperience'
}

const FetchAndDisplayKey: React.FC<Props> = ({ keyPath }) => {
  const [value, setValue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const firestore = getFirestore();

  // Utility for nested value
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
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyPath, auth, firestore]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Render array of objects
  if (Array.isArray(value)) {
    return (
      <div>
        <strong>{keyPath} (Total {value.length} items):</strong>
        {value.map((item: any, index: number) => (
          <div key={index} style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '0.5rem' }}>
            {Object.entries(item).map(([key, val]) => (
              <div key={key} style={{ marginBottom: '0.5rem' }}>
                <strong>{key}:</strong>{' '}
                {Array.isArray(val) ? (
                  <ul>
                    {val.map((subItem: any, subIndex: number) => (
                      <li key={subIndex}>{JSON.stringify(subItem)}</li>
                    ))}
                  </ul>
                ) : typeof val === 'object' && val !== null ? (
                  <pre>{JSON.stringify(val, null, 2)}</pre>
                ) : (
                  <span>{String(val)}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  } else {
    // Fallback for non-array values
    return <div>{String(value)}</div>;
  }
};

export default FetchAndDisplayKey;