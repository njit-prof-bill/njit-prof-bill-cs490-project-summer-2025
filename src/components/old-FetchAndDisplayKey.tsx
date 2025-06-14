import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Props {
  keyName: string; // The key you want to extract from JSON
}

const FetchAndDisplayKey: React.FC<Props> = ({ keyName }) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const firestore = getFirestore();

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

        // Assuming the text field contains JSON string
        const jsonString: string = data.groqResponse;

        console.log('aiResponse string:', data.groqResponse);

        try {
  const jsonString = data.groqResponse;
  const jsonObject = JSON.parse(jsonString);
  // Proceed
} catch (err) {
  console.error('Invalid JSON string:', data.groqResponse);
}

        const jsonObject = JSON.parse(jsonString);

        const keyValue = jsonObject[keyName];

        // console.log(keyValue)

        if (keyValue !== undefined) {
          setValue(String(keyValue));
        } else {
          setError(`Key "${keyName}" not found`);
        }
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyName, auth, firestore]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return <div>{value}</div>;
};

export default FetchAndDisplayKey;