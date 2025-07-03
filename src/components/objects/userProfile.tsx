"use client";
import { Timestamp } from "firebase/firestore";

// Represents info about a single job ad submitted by a user
class jobAdObj {
    public companyName: string = "";
    public dateSubmitted: Timestamp = new Timestamp(0,0);
    public jobDescription: string = "";
    public jobTitle: string = "";
    // Used to associate generated resumes with job ads.
    // Should be set using a document reference.
    public jobID: string = "";
};

// Represents info about a single job on the user's resume
class jobObj {
    public jobTitle: string = "";
    public company: string = "";
    public startDate: string = "";
    public endDate: string = "";
    public jobSummary: string = "";
    public responsibilities: string[] = [];
};

// Represents info about a single academic credential on the user's resume
class eduObj {
    public degree: string = "";
    public institution: string = "";
    public startDate: string = "";
    public endDate: string = "";
    public gpa: string = "";
}

// Represents contact info on a single user's resume
class contactObj {
    public email: string[] = [];
    public phone: string[] = [];
    public location: string = "";
}

// Used to store all the info parsed from the user's multiple resumes into a single profile
class resume {
    public fullName: string = "";
    public contact: contactObj = new contactObj;
    public summary: string = "";
    public workExperience: jobObj[] = [];
    public education: eduObj[] = [];
    public skills: string[] = [];
}

// Represents a single generated resume by the AI
class generatedResume {
    public fullName: string = "";
    public contact: contactObj = new contactObj;
    public summary: string = "";
    public workExperience: jobObj[] = [];
    public education: eduObj[] = [];
    public skills: string[] = [];
    // Used to associate generated resumes with job ads.
    // Should be set using a document reference.
    public resumeID: string = "";
}

// For unstructured, biographical text submitted directly by the user.
class freeFormSubmission {
    public text: string = "";
    public label: string = "";
    public dateSubmitted: Timestamp = new Timestamp(0,0);
}

// The class which I intend to use directly.
export class userProfile {
    // theme property is used by src/context/themeContext.tsx
    theme: string = "system";
    freeFormText: freeFormSubmission[] = [];
    jobAds: jobAdObj[] = [];
    resumeFields: resume = new resume;
    generatedResumes: generatedResume[] = [];
}