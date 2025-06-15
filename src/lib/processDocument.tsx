import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

const defaultPrompt = `You are a helpful resume building assistant. You will assist in receiving user resume text, and filling in the json object format below with the user's extracted data. Striclty use the format provided in this prompt. Do not rearrange any of the json object. Do not include any extra comments, strictly return the json file. The fullname of a person is usually found in the first couple of lines. Do not forget to include the full name of a person in the output. Sometimes names may be ambiguos, like 'Laid-Off' or other non-name type words, include them if in the first line. Do not add any extra comments, return only the json object. "summary" should include any work history points or facts in it. Use This Example json object, and populate a similar json with the data from the input: { "fullName": "", "contact": { "email": "", "phone": "", "location": "" }, "summary": "successful, professional, with, etc, any work comments go here": [ { "jobTitle": "", "company": "", "startDate": "", "endDate": "", "responsibilities": [ "", "", "" ] }, { "jobTitle": "", "company": "", "startDate": "", "endDate": "", "responsibilities": [ "", "", "" ] } ], "education": [ { "degree": "", "institution": "", "startDate": "", "endDate": "", "gpa": "" } ], "skills": [ "", "", "", "", "", "" ] } Important: Do not call work items as 'achievements', call it 'responsibilities'. Follow the above example strictly. Experience should be 'workExperience' key. Reformat the json a second time before responding, double check the json. Do not say 'here is the json, or json or anything extra'.`;

const defaultCleanupPrompt = `You are a JSON formatter and validator. Your task is to take the provided text and ensure it's properly formatted, valid JSON. Please:

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

function cleanJSONResponse(response: string): string {
  if (!response) return response;

  let cleaned = response.trim();
  const prefixPatterns = [
    /^here\s+is\s+the\s+(json|combined\s+json|cleaned\s+json|result)[:\s]*/i,
    /^(json|result)[:\s]*/i,
    /^```json\s*/i,
    /^```\s*/i,
  ];
  const suffixPatterns = [
    /\s*```\s*$/i,
    /\s*this\s+combines?\s+all\s+the\s+data.*$/i,
    /\s*the\s+above\s+json.*$/i,
  ];

  prefixPatterns.forEach(pattern => cleaned = cleaned.replace(pattern, ''));
  suffixPatterns.forEach(pattern => cleaned = cleaned.replace(pattern, ''));

  return cleaned.trim();
}

function validateJSON(jsonString: string): { isValid: boolean; parsed?: any; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    return { isValid: true, parsed };
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function callGroqAPI(text: string, prompt: string): Promise<string | null> {
  try {
    const response = await fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, prompt }),
    });

    if (!response.ok) return null;

    const { response: resText } = await response.json();
    return resText || null;
  } catch (err) {
    console.error('Groq API error:', err);
    return null;
  }
}

export async function processDocumentHandler({
  user,
  additionalPrompt = '',
  sourceDocId = 'documentText',
  targetDocId = 'categoryData',
  textField = 'text',
  onStatus,
}: {
  user: User;
  additionalPrompt?: string;
  sourceDocId?: string;
  targetDocId?: string;
  textField?: string;
  onStatus?: (message: string) => void;
}) {
  const setStatus = (msg: string) => onStatus?.(msg);

  setStatus('📄 Starting document processing...');
  try {
    // Step 1: Fetch the source document
    const sourceDocRef = doc(db, 'users', user.uid, 'userDocuments', sourceDocId);
    const sourceDoc = await getDoc(sourceDocRef);

    if (!sourceDoc.exists()) {
      const errMsg = `❌ Source document not found: ${sourceDocId}`;
      setStatus(errMsg);
      throw new Error(errMsg);
    }

    const textContent = sourceDoc.data()?.[textField];
    if (!textContent) {
      const errMsg = '❌ Text field missing in document';
      setStatus(errMsg);
      throw new Error(errMsg);
    }

    // Step 2: Build full prompt
    const fullPrompt = `${defaultPrompt}${additionalPrompt ? `\n${additionalPrompt}` : ''}`;

    // Step 3: First call to Groq
    setStatus('🤖 Calling Groq API (step 1/2)...');
    const firstResponseRaw = await callGroqAPI(textContent, fullPrompt);
    if (!firstResponseRaw) {
      const errMsg = '❌ Groq API failed on first call';
      setStatus(errMsg);
      throw new Error(errMsg);
    }

    const cleanedFirstResponse = cleanJSONResponse(firstResponseRaw);
    let finalResponse = cleanedFirstResponse;
    let finalValidation = validateJSON(finalResponse);

    // Step 4: Optional cleanup
    if (!finalValidation.isValid) {
      setStatus('🧹 Cleaning up invalid JSON...');
      const cleaned = await callGroqAPI(finalResponse, defaultCleanupPrompt);

      if (cleaned) {
        const cleanedFinal = cleanJSONResponse(cleaned);
        const secondValidation = validateJSON(cleanedFinal);

        if (secondValidation.isValid) {
          finalResponse = cleanedFinal;
          finalValidation = secondValidation;
          setStatus('✅ JSON cleaned and valid');
        } else {
          setStatus(`⚠️ JSON cleanup failed: ${secondValidation.error}`);
        }
      } else {
        setStatus('⚠️ JSON cleanup call failed');
      }
    } else {
      setStatus('✅ Valid JSON from first response');
    }

    // Step 5: Save processed result
    const targetDocRef = doc(db, 'users', user.uid, 'userDocuments', targetDocId);
    await setDoc(targetDocRef, {
      originalText: textContent,
      groqResponse: finalResponse,
      rawFirstResponse: firstResponseRaw,
      prompt: fullPrompt,
      cleanupPrompt: defaultCleanupPrompt,
      isValidJSON: finalValidation.isValid,
      jsonError: finalValidation.error ?? null,
      processedAt: new Date(),
      processedBy: user.uid,
      sourceDocument: sourceDocId,
      processingSteps: {
        firstCallCompleted: true,
        cleanupCallCompleted: firstResponseRaw !== finalResponse,
        finalValidation: finalValidation.isValid,
      },
    });

    setStatus(finalValidation.isValid
      ? '✅ Document processed and saved successfully'
      : '⚠️ Processed but JSON may still have issues');
  } catch (err: any) {
    console.error('❌ Processing failed:', err);
    setStatus(`❌ Unexpected error during processing`);
    throw err;
  }
}
