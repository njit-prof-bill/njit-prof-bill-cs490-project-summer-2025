"use client";

import { model } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const AIPrompt = `Please take this text corpus submitted by a user and parse the following information from it:

1. The user’s full name.
2. The user’s email address.
3. The user’s phone number. If this is not present, leave it blank.
4. The user’s city and state or country. If this is not present, leave it blank.
5. The user’s professional summary (1 to 2 paragraphs). If this is not present, leave it blank.
6. The list of work experiences the user holds.
    For each work experience the user holds, parse the following information:
      - The user’s job title.
      - The name of the company.
      - The start date of the job in YYYY-MM format.
      - The end date of the job either in YYYY-MM format. If this cannot be parsed in YYYY-MM format, substitute it with the word “Present”.
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
| contact.email | String | Email address. |
| contact.phone | String | Phone number (optional). |
| contact.location | String | City and state or country (optional). |
| summary | String | Professional summary (1-2 paragraphs). |
| workExperience | Array of Objects | List of work experiences, ordered most recent first. |
| workExperience[].jobTitle | String | Job title. |
| workExperience[].company | String | Company name. |
| workExperience[].startDate | String | Start date (format: YYYY-MM). |
| workExperience[].endDate | String | End date (or \"Present\"). |
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
    const fullPrompt = prompt + corpus;
    console.log(fullPrompt);
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    return text;
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
                ;
            }
            // Extract summary and save to userProfile
            try {
                await updateDoc(documentRef, { "resumeFields.summary": responseObj.summary });
            } catch (error) {
                ;
            }
            // Extract email and save to userProfile
            try {
                await updateDoc(documentRef, { "resumeFields.contact.email": responseObj.contact.email });
            } catch (error) {
                ;
            }
            // Extract location and save to userProfile
            try {
                await updateDoc(documentRef, { "resumeFields.contact.location": responseObj.contact.location });
            } catch (error) {
                ;
            }
            // Extract phone and save to userProfile
            try {
                await updateDoc(documentRef, { "resumeFields.contact.phone": responseObj.contact.phone });
            } catch (error) {
                ;
            }
            // Extract list of skills and save to userProfile
            try {
                await updateDoc(documentRef, { "resumeFields.skills": responseObj.skills });
            } catch (error) {
                ;
            }
            // Extract list of work experiences and save to userProfile
            try {
                await updateDoc(documentRef, { "resumeFields.workExperience": responseObj.workExperience });
            } catch (error) {
                ;
            }
            // Extract list of education credentials and save to userProfile
            try {
                await updateDoc(documentRef, { "resumeFields.education": responseObj.education });
            } catch (error) {
                ;
            }
        } catch (error) {
            console.error("Error: could not retrieve document;", error);
        }
    }
}