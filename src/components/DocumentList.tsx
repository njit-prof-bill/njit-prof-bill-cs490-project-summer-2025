import { useEffect, useState } from 'react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase'; // Adjust import path as needed

interface DocumentData {
  fileName: string;
  fileType: string;
  text: string;
  uploadedAt: any; // Firebase Timestamp or Date
  docType: string; // To identify which document type it is
  docPath: string; // Store the document path for deletion
}

interface DocumentListProps {
  className?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ className = '' }) => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);

  // Document paths configuration
  const documentPaths = [
    { path: 'documentTextPdf', type: 'PDF' },
    { path: 'documentTextDocx', type: 'DOCX' },
    { path: 'documentTextTxt', type: 'TXT' },
    { path: 'documentTextFreeformText', type: 'Freeform Text' }
  ];

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const uid = user.uid;
        const fetchPromises = documentPaths.map(async ({ path, type }) => {
          try {
            const docRef = doc(db, `users/${uid}/userDocuments/${path}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const data = docSnap.data();
              return {
                fileName: data.fileName || 'Unknown',
                fileType: data.fileType || type,
                text: data.text || '',
                uploadedAt: data.uploadedAt || null,
                docType: type,
                docPath: path
              } as DocumentData;
            }
            return null;
          } catch (err) {
            console.error(`Error fetching ${path}:`, err);
            return null;
          }
        });

        const results = await Promise.all(fetchPromises);
        const validDocuments = results.filter((doc): doc is DocumentData => doc !== null);
        
        setDocuments(validDocuments);
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Helper function to get text preview by character count
  const PREVIEW_CHARACTERS = 300; // ← Change this number to show more/fewer characters
  const getTextPreview = (text: string): string => {
    if (!text) return 'No content available';
    
    if (text.length <= PREVIEW_CHARACTERS) {
      return text;
    }
    
    // Truncate at character limit and try to end at a word boundary
    const truncated = text.substring(0, PREVIEW_CHARACTERS);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    // If we found a space and it's not too far back, cut there
    if (lastSpaceIndex > PREVIEW_CHARACTERS * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'Unknown date';
    
    try {
      // Handle Firebase Timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (docPath: string, docType: string) => {
    if (!confirm(`Are you sure you want to delete this ${docType} document? This action cannot be undone.`)) {
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('User not authenticated');
        return;
      }

      setDeletingDoc(docPath);
      const uid = user.uid;
      const docRef = doc(db, `users/${uid}/userDocuments/${docPath}`);
      
      await deleteDoc(docRef);
      
      // Remove the deleted document from the state
      setDocuments(prev => prev.filter(doc => doc.docPath !== docPath));
      
      setError(null);
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
    } finally {
      setDeletingDoc(null);
    }
  };

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <h2 className="text-xl font-semibold mb-4 text-blue-400">
        User Documents ({documents.length})
      </h2>
      
      {documents.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-6 text-center text-blue-400">
          <p>No documents found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((document, index) => (
            <div 
              key={`${document.docType}-${index}`} 
              className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Document Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium truncate text-orange-600">
                    {document.fileName}
                  </h3>
                  <p className="text-xs opacity-70 mt-1">
                    Uploaded: {formatTimestamp(document.uploadedAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {document.fileType}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {document.docType}
                  </span>
                  <button
                    onClick={() => handleDeleteDocument(document.docPath, document.docType)}
                    disabled={deletingDoc === document.docPath}
                    className="text-xs px-2 py-1 rounded border border-red-300 hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Delete ${document.docType} document`}
                  >
                    {deletingDoc === document.docPath ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
              
              {/* Text Preview */}
              <div className="rounded p-3 border border-gray-100">
                <h4 className="text-xs font-medium mb-2 uppercase tracking-wide text-green-600">
                  Content Preview
                </h4>
                <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed overflow-hidden">
                  {getTextPreview(document.text)}
                </pre>
                {document.text.length > PREVIEW_CHARACTERS && (
                  <p className="text-xs mt-2 italic">
                    ... and more content
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;