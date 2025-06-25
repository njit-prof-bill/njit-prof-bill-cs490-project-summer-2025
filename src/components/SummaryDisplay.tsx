import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface SummaryDisplayProps {
  className?: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ className = '' }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchSummary(currentUser.uid);
      } else {
        setLoading(false);
        setError('User not authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchSummary = async (uid: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const db = getFirestore();
      const docRef = doc(db, 'users', uid, 'userDocuments', 'categoryData');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Check if groqResponse exists
        if (data.groqResponse) {
          try {
            // Parse the JSON string from groqResponse
            const parsedData = JSON.parse(data.groqResponse);
            const summaryData = parsedData.summary || '';
            setSummary(summaryData);
          } catch (parseError) {
            setError('Failed to parse summary data');
            console.error('Error parsing groqResponse JSON:', parseError);
          }
        } else {
          setError('No groqResponse data found');
        }
      } else {
        setError('Document not found');
      }
    } catch (err) {
      setError('Failed to fetch summary data');
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">No Summary</h3>
          <p className="text-gray-500">No summary data available to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      </div>
    </div>
  )
}
export default SummaryDisplay;