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

  setStatus?.('Starting document processing...');
  try {
    setStatus('Retrieving source document...');
    const sourceDocRef = doc(db, 'users', user.uid, 'userDocuments', sourceDocId);
    const sourceDoc = await getDoc(sourceDocRef);

    if (!sourceDoc.exists()) {
      setStatus('❌ Source document not found');
      return;
    }

    const textContent = sourceDoc.data()?.[textField];
    if (!textContent) {
      setStatus('❌ Text field missing in document');
      return;
    }

    const fullPrompt = `${defaultPrompt}${additionalPrompt ? `\n${additionalPrompt}` : ''}`;

    setStatus('Calling Groq API (step 1/2)...');
    const firstResponse = await callGroqAPI(textContent, fullPrompt);
    if (!firstResponse) {
      setStatus('❌ Failed Groq API call');
      return;
    }

    const firstValidation = validateJSON(firstResponse);
    let finalResponse = firstResponse;

    if (!firstValidation.isValid) {
      setStatus('Cleaning up invalid JSON...');
      const cleaned = await callGroqAPI(firstResponse, defaultCleanupPrompt);
      const secondValidation = cleaned && validateJSON(cleaned);

      if (cleaned && secondValidation?.isValid) {
        finalResponse = cleaned;
        setStatus('✅ JSON cleaned and valid');
      } else {
        setStatus('⚠️ Cleanup failed, using original');
      }
    }

    const finalValidation = validateJSON(finalResponse);

    setStatus('Saving result to Firestore...');
    const targetDocRef = doc(db, 'users', user.uid, 'userDocuments', targetDocId);
    await setDoc(targetDocRef, {
      originalText: textContent,
      groqResponse: finalResponse,
      rawFirstResponse: firstResponse,
      prompt: fullPrompt,
      cleanupPrompt: defaultCleanupPrompt,
      isValidJSON: finalValidation.isValid,
      jsonError: finalValidation.error ?? null,
      processedAt: new Date(),
      processedBy: user.uid,
      processingSteps: {
        firstCallCompleted: true,
        cleanupCallCompleted: firstResponse !== finalResponse,
        finalValidation: finalValidation.isValid,
      },
    });

    setStatus(finalValidation.isValid
      ? '✅ Document processed successfully'
      : '⚠️ Processed but JSON might have issues');
  } catch (err) {
    console.error('Processing error:', err);
    setStatus('❌ Unexpected error during processing');
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

function validateJSON(jsonString: string): { isValid: boolean; parsed?: any; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    return { isValid: true, parsed };
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
