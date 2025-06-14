import { auth, db } from '@/lib/firebase'; // Adjust path as needed
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';

interface GroqProcessorProps {}

interface DocumentMapping {
  sourceId: string;
  targetId: string;
  displayName: string;
}

interface ProcessingProgress {
  [key: string]: {
    status: string;
    completed: boolean;
    error?: string;
  };
}

export default function GroqProcessor({}: GroqProcessorProps) {
  // Document mappings
  const documentMappings: DocumentMapping[] = [
    { sourceId: 'documentTextPdf', targetId: 'categoryDataPdf', displayName: 'PDF Document' },
    { sourceId: 'documentTextDocx', targetId: 'categoryDataDocx', displayName: 'DOCX Document' },
    { sourceId: 'documentTextTxt', targetId: 'categoryDataTxt', displayName: 'TXT Document' },
    { sourceId: 'documentTextFreeformText', targetId: 'categoryDataFreeformText', displayName: 'Freeform Text' }
  ];

  const textField = "text";
  const finalCombinedDocId = "categoryData";
  
  const prompt = `You are a helpful resume building assistant. You will assist in receiving user resume text, and filling in the json object format below with the user's extracted data. Strictly use the format provided in this prompt. Do not rearrange any of the json object. Do not include any extra comments, strictly return the json file. The fullname of a person is usually found in the first couple of lines. Do not forget to include the full name of a person in the output. Sometimes names may be ambiguous, like 'Laid-Off' or other non-name type words, include them if in the first line. Do not add any extra comments, return only the json object. "summary" should include any work history points or facts in it. Use This Example json object, and populate a similar json with the data from the input: { "fullName": "", "contact": { "email": "", "phone": "", "location": "" }, "summary": "successful, professional, with, etc, any work comments go here", "workExperience": [ { "jobTitle": "", "company": "", "startDate": "", "endDate": "", "responsibilities": [ "", "", "" ] }, { "jobTitle": "", "company": "", "startDate": "", "endDate": "", "responsibilities": [ "", "", "" ] } ], "education": [ { "degree": "", "institution": "", "startDate": "", "endDate": "", "gpa": "" } ], "skills": [ "", "", "", "", "", "" ] } Important: Do not call work items as 'achievements', call it 'responsibilities'. Follow the above example strictly. Experience should be 'workExperience' key. Reformat the json a second time before responding, double check the json. Do not say 'here is the json, or json or anything extra'.`;

  const cleanupPrompt = `You are a JSON formatter and validator. Your task is to take the provided text and ensure it's properly formatted, valid JSON. Please:

1. Remove any extra text, comments, or explanations that aren't part of the JSON
2. Fix any JSON syntax errors (missing commas, brackets, quotes, etc.)
3. Ensure all strings are properly quoted
4. Validate that the JSON structure is correct
5. Return ONLY the cleaned, valid JSON - no additional text or explanations

The JSON should follow this exact structure:
{
  "fullName": "",
  "contact": {
    "email": "",
    "phone": "",
    "location": ""
  },
  "summary": "",
  "workExperience": [
    {
      "jobTitle": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": ["", "", ""]
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "startDate": "",
      "endDate": "",
      "gpa": ""
    }
  ],
  "skills": ["", "", "", "", "", ""]
}

Return only the valid JSON, nothing else.`;

  const combinePrompt = `You are a data consolidation assistant. You will receive multiple JSON objects containing resume data extracted from different document sources. Your task is to intelligently combine them into a single, comprehensive JSON object while avoiding duplicates and conflicting information.

Rules for combining:
1. Use the most complete and detailed information when there are conflicts
2. Merge all unique work experiences, education entries, and skills
3. For contact information, use the most complete version
4. For fullName, use the most complete version (prefer full names over partial ones)
5. For summary, combine unique points and create a comprehensive summary
6. Remove duplicate entries in workExperience, education, and skills arrays
7. Maintain the exact JSON structure provided
8. Return ONLY the combined JSON, no additional text or explanations

Expected output structure:
{
  "fullName": "",
  "contact": {
    "email": "",
    "phone": "",
    "location": ""
  },
  "summary": "",
  "workExperience": [
    {
      "jobTitle": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": ["", "", ""]
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "startDate": "",
      "endDate": "",
      "gpa": ""
    }
  ],
  "skills": ["", "", "", "", "", ""]
}

Combine the following JSON objects:`;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [overallStatus, setOverallStatus] = useState<string>('');
  const [progress, setProgress] = useState<ProcessingProgress>({});
  const [currentStep, setCurrentStep] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const callGroqAPI = async (text: string, promptToUse: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          prompt: promptToUse
        }),
      });

      if (!response.ok) {
        console.error('Failed to call Groq API');
        return null;
      }

      const { response: groqResponse } = await response.json();
      return groqResponse || null;
    } catch (error) {
      console.error('Error calling Groq API:', error);
      return null;
    }
  };

  const validateJSON = (jsonString: string): { isValid: boolean; parsed?: any; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      return { isValid: true, parsed };
    } catch (error) {
      return { isValid: false, error: error instanceof Error ? error.message : 'Unknown JSON error' };
    }
  };

  const updateProgress = (docId: string, status: string, completed: boolean = false, error?: string) => {
    setProgress(prev => ({
      ...prev,
      [docId]: { status, completed, error }
    }));
  };

  const processIndividualDocument = async (mapping: DocumentMapping): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      updateProgress(mapping.sourceId, 'Retrieving document...', false);
      
      // 1. Retrieve document text field
      const sourceDocRef = doc(db, 'users', user!.uid, 'userDocuments', mapping.sourceId);
      const sourceDoc = await getDoc(sourceDocRef);
      
      if (!sourceDoc.exists()) {
        updateProgress(mapping.sourceId, 'Document not found', true, 'Document does not exist');
        return { success: false, error: 'Document not found' };
      }

      const textContent = sourceDoc.data()[textField];
      if (!textContent) {
        updateProgress(mapping.sourceId, 'No text content found', true, 'Text field is empty');
        return { success: false, error: 'No text content found' };
      }

      // 2. First Groq API call - Extract resume data
      updateProgress(mapping.sourceId, 'Processing with Groq (Step 1/2)...', false);
      const firstResponse = await callGroqAPI(textContent, prompt);
      
      if (!firstResponse) {
        updateProgress(mapping.sourceId, 'Groq processing failed', true, 'No response from Groq');
        return { success: false, error: 'Groq processing failed' };
      }

      // 3. Validate the first response
      const firstValidation = validateJSON(firstResponse);
      let finalResponse = firstResponse;

      // 4. Second Groq API call - Clean up JSON if needed
      if (!firstValidation.isValid) {
        updateProgress(mapping.sourceId, 'Cleaning up JSON (Step 2/2)...', false);
        
        const cleanedResponse = await callGroqAPI(firstResponse, cleanupPrompt);
        
        if (cleanedResponse) {
          const secondValidation = validateJSON(cleanedResponse);
          if (secondValidation.isValid) {
            finalResponse = cleanedResponse;
          }
        }
      }

      // 5. Final validation check
      const finalValidation = validateJSON(finalResponse);

      // 6. Store result
      updateProgress(mapping.sourceId, 'Saving processed data...', false);
      const targetDocRef = doc(db, 'users', user!.uid, 'userDocuments', mapping.targetId);
      await setDoc(targetDocRef, {
        originalText: textContent,
        groqResponse: finalResponse,
        rawFirstResponse: firstResponse,
        prompt: prompt,
        cleanupPrompt: cleanupPrompt,
        isValidJSON: finalValidation.isValid,
        jsonError: finalValidation.error || null,
        processedAt: new Date(),
        processedBy: user!.uid,
        sourceDocument: mapping.sourceId,
        processingSteps: {
          firstCallCompleted: true,
          cleanupCallCompleted: firstResponse !== finalResponse,
          finalValidation: finalValidation.isValid
        }
      });

      if (finalValidation.isValid) {
        updateProgress(mapping.sourceId, '✅ Processed successfully', true);
        return { success: true, data: finalValidation.parsed };
      } else {
        updateProgress(mapping.sourceId, '⚠️ Processed with JSON issues', true, finalValidation.error);
        return { success: true, data: null };
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateProgress(mapping.sourceId, '❌ Processing failed', true, errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const combineAllDocuments = async (processedData: any[]): Promise<boolean> => {
    try {
      setCurrentStep('Combining all processed documents...');
      
      // Filter out null/invalid data
      const validData = processedData.filter(data => data !== null);
      
      if (validData.length === 0) {
        setOverallStatus('❌ No valid data to combine');
        return false;
      }

      // Prepare the combine prompt with all valid JSON data
      const jsonStrings = validData.map(data => JSON.stringify(data, null, 2));
      const fullCombinePrompt = combinePrompt + '\n\n' + jsonStrings.join('\n\n---\n\n');

      // Call Groq to combine the data
      const combinedResponse = await callGroqAPI('', fullCombinePrompt);
      
      if (!combinedResponse) {
        setOverallStatus('❌ Failed to combine documents');
        return false;
      }

      // Validate and clean up combined response if needed
      let finalCombinedResponse = combinedResponse;
      const combinedValidation = validateJSON(combinedResponse);
      
      if (!combinedValidation.isValid) {
        setCurrentStep('Cleaning up combined JSON...');
        const cleanedCombined = await callGroqAPI(combinedResponse, cleanupPrompt);
        
        if (cleanedCombined) {
          const cleanedValidation = validateJSON(cleanedCombined);
          if (cleanedValidation.isValid) {
            finalCombinedResponse = cleanedCombined;
          }
        }
      }

      // Store the final combined result
      setCurrentStep('Saving combined data...');
      const finalDocRef = doc(db, 'users', user!.uid, 'userDocuments', finalCombinedDocId);
      await setDoc(finalDocRef, {
        combinedData: finalCombinedResponse,
        sourceDocuments: documentMappings.map(m => m.targetId),
        processedAt: new Date(),
        processedBy: user!.uid,
        isValidJSON: validateJSON(finalCombinedResponse).isValid,
        combinePrompt: combinePrompt,
        numberOfSourceDocuments: validData.length
      });

      return true;
    } catch (error) {
      console.error('Error combining documents:', error);
      setOverallStatus('❌ Error combining documents');
      return false;
    }
  };

  const processAllDocuments = async () => {
    if (!user) return;

    setProcessing(true);
    setOverallStatus('Starting multi-document processing...');
    setProgress({});
    setCurrentStep('');

    try {
      // Process each document individually
      const results = [];
      for (const mapping of documentMappings) {
        setCurrentStep(`Processing ${mapping.displayName}...`);
        const result = await processIndividualDocument(mapping);
        results.push(result);
      }

      // Check if any documents were processed successfully
      const successfulResults = results.filter(r => r.success);
      const validData = successfulResults.map(r => r.data).filter(data => data !== null);

      if (validData.length === 0) {
        setOverallStatus('❌ No documents were processed successfully');
        return;
      }

      // Combine all successfully processed documents
      const combineSuccess = await combineAllDocuments(validData);
      
      if (combineSuccess) {
        setOverallStatus(`✅ Successfully processed ${successfulResults.length}/${results.length} documents and created combined result`);
      } else {
        setOverallStatus(`⚠️ Processed ${successfulResults.length}/${results.length} documents but failed to combine`);
      }
      
    } catch (error) {
      setOverallStatus('❌ Error during processing');
      console.error('Error processing documents:', error);
    } finally {
      setProcessing(false);
      setCurrentStep('');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in to continue</div>;

  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const totalCount = documentMappings.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Multi-Document Resume Data Extractor</h3>
        <p className="text-gray-600 mb-4">
          Extract and format resume data from multiple document sources (PDF, DOCX, TXT, Freeform) using AI processing with automatic combination and deduplication.
        </p>
      </div>
      
      {overallStatus && (
        <div className={`mb-4 p-3 rounded ${
          overallStatus.includes('Error') || overallStatus.includes('❌') 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : overallStatus.includes('Warning') || overallStatus.includes('⚠️')
            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
            : overallStatus.includes('✅')
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-blue-100 text-blue-700 border border-blue-300'
        }`}>
          {overallStatus}
        </div>
      )}

      {currentStep && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded">
          <strong>Current Step:</strong> {currentStep}
        </div>
      )}
      
      {Object.keys(progress).length > 0 && (
        <div className="mb-4 space-y-2">
          <h4 className="font-medium text-gray-700">Document Processing Status:</h4>
          {documentMappings.map(mapping => {
            const docProgress = progress[mapping.sourceId];
            if (!docProgress) return null;
            
            return (
              <div key={mapping.sourceId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">{mapping.displayName}:</span>
                <span className={`text-sm ${
                  docProgress.error 
                    ? 'text-red-600' 
                    : docProgress.completed 
                    ? 'text-green-600' 
                    : 'text-blue-600'
                }`}>
                  {docProgress.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
      
      <button 
        onClick={processAllDocuments}
        disabled={processing}
        className={`px-6 py-3 rounded font-medium transition-colors ${
          processing 
            ? 'bg-gray-400 cursor-not-allowed text-gray-700' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {processing ? 'Processing All Documents...' : 'Process All Documents with Groq'}
      </button>
      
      {processing && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{width: `${progressPercentage}%`}}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Processing {completedCount}/{totalCount} documents... This may take a few minutes.
          </p>
        </div>
      )}
    </div>
  );
}