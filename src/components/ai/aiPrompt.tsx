"use client";

import { model } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

export const AIPrompt = `Please take this text corpus submitted by a user and parse the following information from it:

1. The user’s full name.
2. The user’s email addresses.
3. The user’s phone numbers, each one formatted as XXX-XXX-XXXX where X is a number from 0 to 9. If no phone numbers are present, leave it blank.
4. The user’s city and state or country. If this is not present, leave it blank.
5. The user’s professional summary (1 to 2 paragraphs). If this is not present, leave it blank.
6. The list of work experiences the user holds.
    For each work experience the user holds, parse the following information:
      - The user’s job title.
      - The name of the company.
      - The start date of the job in YYYY-MM format.
      - The end date of the job either in YYYY-MM format. If this cannot be parsed in YYYY-MM format, substitute it with the word “Present”.
      - The summary of the job role. If this is not present, leave it blank.
      - The list of the user’s responsibilities and accomplishments while working at the job.
7. The list of educational qualifications the user holds.
    For each educational qualification the user holds, parse the following information:
      - The degree title.
      - The name of the school or university.
      - The start date in YYYY-MM format.
      - The end date in YYYY-MM format.  If this cannot be parsed in YYYY-MM format, substitute it with the word “Present”.
      - The user’s GPA. If this is not present, leave it blank.
8. The user’s list of skills.

Please return your response as a strict JSON object in the following structure:

*** Start of Resume JSON Structure ***
| Field | Type | Description |
|-------|------|-------------|
| fullName | String | Full name of the user. |
| contact | Object | User's contact details. |
| contact.email | Array of Strings | Email addresses. |
| contact.phone | Array of Strings | Phone numbers (optional; also should have the format: XXX-XXX-XXXX with X being a number from 0 to 9). |
| contact.location | String | City and state or country (optional). |
| summary | String | Professional summary (1-2 paragraphs). |
| workExperience | Array of Objects | List of work experiences, ordered most recent first. |
| workExperience[].jobTitle | String | Job title. |
| workExperience[].company | String | Company name. |
| workExperience[].startDate | String | Start date (format: YYYY-MM). |
| workExperience[].endDate | String | End date (or \"Present\"). |
| workExperience[].jobSummary | String | Summary of the job role. |
| workExperience[].responsibilities | Array of Strings | Bullet points of responsibilities/accomplishments. |
| education | Array of Objects | Educational qualifications, ordered by most recent first. |
| education[].degree | String | Degree title (e.g., \"Bachelor of Science in Computer Science\"). |
| education[].institution | String | Name of the school or university. |
| education[].startDate | String | Start date (format: YYYY-MM). |
| education[].endDate | String | End date (or \"Present\"). |
| education[].gpa | String | GPA if available (optional). |
| skills | Array of Strings | List of skills. |
*** End of Resume JSON Structure ***

Do not include any explanation, markdown, rich text, or commentary in your response.

Here is the user's text corpus:

`;

export async function getAIResponse(prompt: string, corpus: string) {
    try {
        const fullPrompt = prompt + corpus;
        //console.log(fullPrompt);
        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const text = response.text();
        // AI's response has '```json' as first line
        // and '```' as last line, which prevents
        // JSON.parse() from processing it correctly.
        var lines = text.split('\n');
        lines.splice(0,1);  // Remove 1st line
        lines.splice(-1,1); // Remove last line
        var finalResponse = lines.join('\n');
        return finalResponse;
    } catch (error) {
        console.error("Error obtaining AI response: ", error);
        return "";
    }
    
}

export async function saveAIResponse(responseObj: any, user: any, db: any) {
    if (user) {
        const documentRef = doc(db, "users", user.uid);
        try {
            const document = await getDoc(documentRef);
            if (!document.exists()) {
                return;
            }
            // Extract full name and save to userProfile
            try {
                await updateDoc(documentRef, { "resumeFields.fullName": responseObj.fullName });
            } catch (error) {
                console.error("Error fetching full name from corpus: ", error);
            }
            // Extract summary and save to userProfile
            try {
                await updateDoc(documentRef, { "resumeFields.summary": responseObj.summary });
            } catch (error) {
                console.error("Error fetching summary from corpus: ", error);
            }
            // Extract email and save to userProfile
            try {
                // await updateDoc(documentRef, { "resumeFields.contact.email": responseObj.contact.email });
                await updateDoc(documentRef, {
                    "resumeFields.contact.email": arrayUnion(...responseObj.contact.email)
                })
            } catch (error) {
                console.error("Error appending contact email(s) from corpus: ", error);
            }
            // Extract location and save to userProfile
            try {
                await updateDoc(documentRef, { "resumeFields.contact.location": responseObj.contact.location });
            } catch (error) {
                console.error("Error fetching contact location from corpus: ", error);
            }
            // Extract phone and save to userProfile
            try {
                // await updateDoc(documentRef, { "resumeFields.contact.phone": responseObj.contact.phone });
                await updateDoc(documentRef, {
                    "resumeFields.contact.phone": arrayUnion(...responseObj.contact.phone)
                });
            } catch (error) {
                console.error("Error appending phone number(s) from corpus: ", error);
            }
            // Extract list of skills and save to userProfile
            try {
                await updateDoc(documentRef, { "resumeFields.skills": responseObj.skills });
            } catch (error) {
                console.error("Error fetching list of skills from corpus: ", error);
            }
            // Extract list of work experiences and save to userProfile
            try {
                await updateDoc(documentRef, { "resumeFields.workExperience": responseObj.workExperience });
            } catch (error) {
                console.error("Error fetching list of work experiences from corpus: ", error);
            }
            // Extract list of education credentials and save to userProfile
            try {
                await updateDoc(documentRef, { "resumeFields.education": responseObj.education });
            } catch (error) {
                console.error("Error fetching list of educational credentials from corpus: ", error);
            }
        } catch (error) {
            console.error("Error: could not retrieve document;", error);
        }
    }
}

export const jobAdAIPrompt = `
Extract the following information from the text of a job ad:
- Company Name
- Job Title
- Job Description

Return the result as a strict JSON object with the following structure:

*** Start of Job Ad JSON Structure ***
| Field | Type | Description |
|-------|------|-------------|
| companyName | String | The name of the company in the job ad. |
| jobTitle | String | The job title of the job ad. |
| jobDescription | String | The job description of the job ad. |
*** End of Job Ad JSON Structure ***
`;

export async function getJobAdAIResponse(aiClient: any, jobAdText: string) {
  // Replace with your actual AI call logic
  const prompt = jobAdAIPrompt + "\n\nJob Ad:\n" + jobAdText;
  const aiResponse = await aiClient(prompt);
  return aiResponse;
}