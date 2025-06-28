import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface WorkExperience {
  jobTitle: string;
  jobDesc: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

interface WorkExperienceDisplayProps {
  className?: string;
}

const WorkExperienceDisplay: React.FC<WorkExperienceDisplayProps> = ({ className = '' }) => {
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchWorkExperience(currentUser.uid);
      } else {
        setLoading(false);
        setError('User not authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchWorkExperience = async (uid: string) => {
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
            const workExp = parsedData.workExperience || [];
            setWorkExperience(workExp);
          } catch (parseError) {
            setError('Failed to parse work experience data');
            console.error('Error parsing groqResponse JSON:', parseError);
          }
        } else {
          setError('No groqResponse data found');
        }
      } else {
        setError('Document not found');
      }
    } catch (err) {
      setError('Failed to fetch work experience data');
      console.error('Error fetching work experience:', err);
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

  if (!workExperience.length) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V8m8 0V6a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">No Work Experience</h3>
          <p className="text-gray-500">No work experience data available to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Work Experience</h2>
        
        <div className="space-y-6">
          {workExperience.map((experience, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">
                    {experience.jobTitle}
                  </h3>
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-2">
                    {experience.company}
                  </p>
                </div>
                <div className="text-sm text-gray-500 sm:text-right">
                  <span className="font-medium">
                    {experience.startDate} - {experience.endDate}
                  </span>
                </div>
              </div>
              
              {experience.jobDesc && (
                <div className="mb-4">
                  <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                    {experience.jobDesc}
                  </p>
                </div>
              )}
              
              {experience.responsibilities && experience.responsibilities.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 uppercase tracking-wide">
                    Key Responsibilities
                  </h4>
                  <ul className="space-y-2">
                    {experience.responsibilities.map((responsibility, respIndex) => (
                      <li key={respIndex} className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                        <span className="text-sm leading-relaxed">
                          {responsibility}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkExperienceDisplay;