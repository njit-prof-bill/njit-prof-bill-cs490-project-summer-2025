import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface Education {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

interface EducationDisplayProps {
  className?: string;
}

const EducationDisplay: React.FC<EducationDisplayProps> = ({ className = '' }) => {
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchEducation(currentUser.uid);
      } else {
        setLoading(false);
        setError('User not authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchEducation = async (uid: string) => {
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
            const educationData = parsedData.education || [];
            setEducation(educationData);
          } catch (parseError) {
            setError('Failed to parse education data');
            console.error('Error parsing groqResponse JSON:', parseError);
          }
        } else {
          setError('No groqResponse data found');
        }
      } else {
        setError('Document not found');
      }
    } catch (err) {
      setError('Failed to fetch education data');
      console.error('Error fetching education:', err);
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

  if (!education.length) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">No Education</h3>
          <p className="text-gray-500">No education data available to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        {/* <h2 className="text-2xl font-bold mb-6">Education</h2> */}
        
        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">
                    {edu.degree}
                  </h3>
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-2">
                    {edu.institution}
                  </p>
                </div>
                <div className="text-sm text-gray-500 sm:text-right">
                  <span className="font-medium">
                    {edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : 
                     edu.endDate ? edu.endDate : 
                     edu.startDate ? edu.startDate : 'Date not specified'}
                  </span>
                  {edu.gpa && (
                    <div className="mt-1">
                      <span className="text-xs">GPA: {edu.gpa}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EducationDisplay;