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
    lastProcessed?: Date;
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
  
  const prompt = `You are a helpful resume building assistant. You will assist in receiving user resume text, and filling in the json object format below with the user's extracted data. 

CRITICAL INSTRUCTIONS:
- Return ONLY the JSON object, nothing else
- No comments, explanations, or additional text
- No markdown formatting or code blocks
- Do not start with "Here is the JSON:" or similar phrases
- Do not end with explanations or notes
- Strictly use the format provided
- Do not rearrange any of the json object
- The fullname of a person is usually found in the first couple of lines
- Do not forget to include the full name of a person in the output
- Sometimes names may be ambiguous, like 'Laid-Off' or other non-name type words, include them if in the first line
- "summary" should include any work history points or facts in it
- Do not call work items as 'achievements', call it 'responsibilities'
- Experience should be 'workExperience' key
- Reformat the json a second time before responding, double check the json

Use This Example json object, and populate a similar json with the data from the input:
{
  "fullName": "",
  "contact": {
    "email": "",
    "phone": "",
    "location": ""
  },
  "summary": "successful, professional, with, etc, any work comments go here",
  "workExperience": [
    {
      "jobTitle": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": [
        "",
        "",
        ""
      ]
    },
    {
      "jobTitle": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": [
        "",
        "",
        ""
      ]
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
  "skills": [
    "",
    "",
    "",
    "",
    "",
    ""
  ]
}

REMEMBER: Return ONLY the JSON object with no additional text, comments, or formatting.`;

  const cleanupPrompt = `You are a JSON formatter and validator. Your ONLY task is to return clean, valid JSON.

CRITICAL RULES:
- Return ONLY the JSON object
- NO explanations, comments, or additional text
- NO "Here is the cleaned JSON:" or similar phrases  
- NO markdown code blocks or formatting
- Remove any extra text that isn't part of the JSON
- Fix any JSON syntax errors (missing commas, brackets, quotes, etc.)
- Ensure all strings are properly quoted
- Validate that the JSON structure is correct

The JSON MUST follow this exact structure:
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

RETURN ONLY THE VALID JSON OBJECT - NOTHING ELSE.`;

  const combinePrompt = `You are a data consolidation assistant. Your task is to combine multiple JSON objects containing resume data into a single, comprehensive JSON object.

CRITICAL INSTRUCTIONS:
- Return ONLY the final combined JSON object
- NO explanations, comments, or additional text
- NO "Here is the combined JSON:" or similar phrases
- NO markdown formatting or code blocks
- NO introductory or concluding remarks

Rules for combining:
1. Use the most complete and detailed information when there are conflicts
2. Merge all unique work experiences, education entries, and skills
3. For contact information, use the most complete version
4. For fullName, use the most complete version (prefer full names over partial ones)
5. For summary, combine unique points and create a comprehensive summary
6. Remove duplicate entries in workExperience, education, and skills arrays
7. Maintain the exact JSON structure provided below

Expected output structure (return only this JSON format):
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

RETURN ONLY THE COMBINED JSON OBJECT - NO OTHER TEXT WHATSOEVER.

Combine the following JSON objects:`;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingIndividual, setProcessingIndividual] = useState<{[key: string]: boolean}>({});
  const [processingAll, setProcessingAll] = useState(false);
  const [combiningAll, setCombiningAll] = useState(false);
  const [overallStatus, setOverallStatus] = useState<string>('');
  const [progress, setProgress] = useState<ProcessingProgress>({});
  const [combineStatus, setCombineStatus] = useState<string>('');

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

  // Enhanced JSON cleaning function to remove common extra text patterns
  const cleanJSONResponse = (response: string): string => {
    if (!response) return response;
    
    let cleaned = response.trim();
    
    // Remove common prefixes
    const prefixPatterns = [
      /^here\s+is\s+the\s+(json|combined\s+json|cleaned\s+json|result)[:\s]*/i,
      /^(json|result)[:\s]*/i,
      /^```json\s*/i,
      /^```\s*/i,
    ];
    
    // Remove common suffixes  
    const suffixPatterns = [
      /\s*```\s*$/i,
      /\s*this\s+combines?\s+all\s+the\s+data.*$/i,
      /\s*the\s+above\s+json.*$/i,
    ];
    
    prefixPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    suffixPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    return cleaned.trim();
  };

  const updateProgress = (docId: string, status: string, completed: boolean = false, error?: string) => {
    setProgress(prev => ({
      ...prev,
      [docId]: { 
        status, 
        completed, 
        error,
        lastProcessed: completed ? new Date() : prev[docId]?.lastProcessed
      }
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

      // Clean the first response
      const cleanedFirstResponse = cleanJSONResponse(firstResponse);

      // 3. Validate the first response
      const firstValidation = validateJSON(cleanedFirstResponse);
      let finalResponse = cleanedFirstResponse;

      // 4. Second Groq API call - Clean up JSON if needed
      if (!firstValidation.isValid) {
        updateProgress(mapping.sourceId, 'Cleaning up JSON (Step 2/2)...', false);
        
        const cleanedResponse = await callGroqAPI(cleanedFirstResponse, cleanupPrompt);
        
        if (cleanedResponse) {
          const cleanedSecondResponse = cleanJSONResponse(cleanedResponse);
          const secondValidation = validateJSON(cleanedSecondResponse);
          if (secondValidation.isValid) {
            finalResponse = cleanedSecondResponse;
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

  // Process single document
  const processSingleDocument = async (mapping: DocumentMapping) => {
    if (!user) return;

    setProcessingIndividual(prev => ({ ...prev, [mapping.sourceId]: true }));
    
    try {
      await processIndividualDocument(mapping);
    } catch (error) {
      console.error(`Error processing ${mapping.displayName}:`, error);
    } finally {
      setProcessingIndividual(prev => ({ ...prev, [mapping.sourceId]: false }));
    }
  };

  // Process all documents
  const processAllDocuments = async () => {
    if (!user) return;

    setProcessingAll(true);
    setOverallStatus('Starting batch extraction of all documents...');
    setProgress({});

    try {
      // Process each document individually
      const results = [];
      for (const mapping of documentMappings) {
        const result = await processIndividualDocument(mapping);
        results.push(result);
      }

      // Check results
      const successfulResults = results.filter(r => r.success);
      
      if (successfulResults.length === 0) {
        setOverallStatus('❌ No documents were processed successfully');
      } else {
        setOverallStatus(`✅ Successfully extracted ${successfulResults.length}/${results.length} documents. Ready to combine!`);
      }
      
    } catch (error) {
      setOverallStatus('❌ Error during batch extraction');
      console.error('Error processing documents:', error);
    } finally {
      setProcessingAll(false);
    }
  };

  // Combine all processed documents
  const combineAllDocuments = async () => {
    if (!user) return;

    setCombiningAll(true);
    setCombineStatus('Starting document combination...');

    try {
      // Collect all groqResponse strings from processed documents
      const groqResponses = [];
      const documentNames = [];

      for (const mapping of documentMappings) {
        setCombineStatus(`Retrieving ${mapping.displayName} data...`);
        
        const targetDocRef = doc(db, 'users', user.uid, 'userDocuments', mapping.targetId);
        const targetDoc = await getDoc(targetDocRef);
        
        if (targetDoc.exists()) {
          const docData = targetDoc.data();
          // Get the groqResponse text directly (whether it's valid JSON or not)
          if (docData.groqResponse && docData.groqResponse.trim()) {
            groqResponses.push(docData.groqResponse);
            documentNames.push(mapping.displayName);
            console.log(`Found groqResponse for ${mapping.displayName}:`, docData.groqResponse.substring(0, 100) + '...');
          }
        }
      }

      if (groqResponses.length === 0) {
        setCombineStatus('❌ No processed documents found to combine. Please extract documents first.');
        return;
      }

      setCombineStatus(`Combining ${groqResponses.length} documents with AI...`);
      console.log(`Combining ${groqResponses.length} groqResponses:`, groqResponses);

      // Prepare the combine prompt with all groqResponse strings
      const combinedText = groqResponses.join('\n\n---DOCUMENT SEPARATOR---\n\n');

      console.log('Combined text length:', combinedText.length);

      // Call Groq to combine the data - pass the combined text as the 'text' parameter
      const combinedResponse = await callGroqAPI(combinedText, combinePrompt);
      
      if (!combinedResponse) {
        setCombineStatus('❌ Failed to get response from Groq API for combination');
        return;
      }

      console.log('Combined response received:', combinedResponse.substring(0, 200) + '...');

      // Clean the combined response first
      const cleanedCombinedResponse = cleanJSONResponse(combinedResponse);

      // Validate and clean up combined response if needed
      setCombineStatus('Validating combined result...');
      let finalCombinedResponse = cleanedCombinedResponse;
      const combinedValidation = validateJSON(cleanedCombinedResponse);
      
      if (!combinedValidation.isValid) {
        setCombineStatus('Cleaning up combined JSON...');
        console.log('Combined response needs cleanup:', combinedValidation.error);
        
        const cleanedCombined = await callGroqAPI(cleanedCombinedResponse, cleanupPrompt);
        
        if (cleanedCombined) {
          const finalCleaned = cleanJSONResponse(cleanedCombined);
          const cleanedValidation = validateJSON(finalCleaned);
          if (cleanedValidation.isValid) {
            finalCombinedResponse = finalCleaned;
            console.log('Successfully cleaned combined response');
          } else {
            console.log('Cleanup failed:', cleanedValidation.error);
          }
        }
      } else {
        console.log('Combined response is already valid JSON');
      }

      // Store the final combined result
      setCombineStatus('Saving combined data...');
      const finalDocRef = doc(db, 'users', user.uid, 'userDocuments', finalCombinedDocId);
      await setDoc(finalDocRef, {

        // changed attribute key in doc back to groqResponse, since the other components
        // might still be using that convention.

        // combinedData: finalCombinedResponse,
        //groqResponse is current naming convention for now for this attribute.
        groqResponse: finalCombinedResponse,

        sourceDocuments: documentMappings.map(m => m.targetId),
        processedAt: new Date(),
        processedBy: user.uid,
        isValidJSON: validateJSON(finalCombinedResponse).isValid,
        combinePrompt: combinePrompt,
        numberOfSourceDocuments: groqResponses.length,
        sourceDocumentNames: documentNames,
        rawCombinedResponse: combinedResponse // Store original response for debugging
      });

      setCombineStatus(`✅ Successfully combined ${groqResponses.length} documents into final result`);
    } catch (error) {
      console.error('Error combining documents:', error);
      setCombineStatus(`❌ Error combining documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCombiningAll(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in to continue</div>;

  const getStatusColor = (status: string) => {
    if (status.includes('Error') || status.includes('❌')) return 'bg-red-100 text-red-700 border-red-300';
    if (status.includes('Warning') || status.includes('⚠️')) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (status.includes('✅')) return 'bg-green-100 text-green-700 border-green-300';
    return 'bg-blue-100 text-blue-700 border-blue-300';
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Multi-Document Resume Data Extractor</h3>
        <p className="text-gray-600">
          Extract and format resume data from multiple document sources, then combine them into a unified result.
        </p>
      </div>

      {/* Step 1: Document Extraction */}
      <div className="mb-8 p-4 border rounded-lg">
        <h4 className="text-lg font-semibold mb-4">Step 1: Document Extraction</h4>
        
        {/* Individual Document Processing */}
        <div className="mb-6">
          <h5 className="font-medium mb-3">Individual Document Processing:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentMappings.map(mapping => {
              const docProgress = progress[mapping.sourceId];
              const isProcessing = processingIndividual[mapping.sourceId];
              
              return (
                <div key={mapping.sourceId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h6 className="font-medium">{mapping.displayName}</h6>
                    <button 
                      onClick={() => processSingleDocument(mapping)}
                      disabled={isProcessing || processingAll}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        isProcessing || processingAll
                          ? 'bg-gray-400 cursor-not-allowed text-gray-700' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isProcessing ? 'Processing...' : 'Extract'}
                    </button>
                  </div>
                  
                  {docProgress && (
                    <div className="text-sm">
                      <div className={`p-2 rounded ${
                        docProgress.error 
                          ? 'bg-red-50 text-red-600' 
                          : docProgress.completed 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {docProgress.status}
                      </div>
                      {docProgress.lastProcessed && (
                        <div className="text-gray-500 text-xs mt-1">
                          Last processed: {docProgress.lastProcessed.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Batch Processing */}
        <div className="border-t pt-4">
          <h5 className="font-medium mb-3">Batch Processing:</h5>
          <button 
            onClick={processAllDocuments}
            disabled={processingAll || Object.values(processingIndividual).some(p => p)}
            className={`px-6 py-3 rounded font-medium transition-colors ${
              processingAll || Object.values(processingIndividual).some(p => p)
                ? 'bg-gray-400 cursor-not-allowed text-gray-700' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {processingAll ? 'Extracting All Documents...' : 'Extract All Documents'}
          </button>
          
          {overallStatus && (
            <div className={`mt-3 p-3 rounded border ${getStatusColor(overallStatus)}`}>
              {overallStatus}
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Document Combination */}
      <div className="mb-6 p-4 border rounded-lg">
        <h4 className="text-lg font-semibold mb-4">Step 2: Document Combination</h4>
        <p className="text-gray-600 mb-4">
          Combine all successfully extracted documents into a single, deduplicated result.
        </p>
        
        <button 
          onClick={combineAllDocuments}
          disabled={combiningAll}
          className={`px-6 py-3 rounded font-medium transition-colors ${
            combiningAll 
              ? 'bg-gray-400 cursor-not-allowed text-gray-700' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {combiningAll ? 'Combining Documents...' : 'Combine All Extracted Data'}
        </button>
        
        {combineStatus && (
          <div className={`mt-3 p-3 rounded border ${getStatusColor(combineStatus)}`}>
            {combineStatus}
          </div>
        )}
        
        {combiningAll && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Combining documents with AI...</p>
          </div>
        )}
      </div>
    </div>
  );
}