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

    // Setter functions
    // public updateCompany(newCompany: string) {
    //     this.companyName = newCompany;
    // }
    // public updateDate(newDate: Timestamp) {
    //     this.dateSubmitted = newDate;
    // }
    // public updateJobDescription(newDes: string) {
    //     this.jobDescription = newDes;
    // }
    // public updateJobTitle(newJob: string) {
    //     this.jobTitle = newJob;
    // }

    // Getter functions
    // public getJobTitle() {
    //     return this.jobTitle;
    // }
    // public getCompany() {
    //     return this.companyName;
    // }
    // public getDate() {
    //     return this.dateSubmitted;
    // }
    // public getJobDescription() {
    //     return this.jobDescription;
    // }
};

// Represents info about a single job on the user's resume
class jobObj {
    public jobTitle: string = "";
    public company: string = "";
    public startDate: string = "";
    public endDate: string = "";
    public jobSummary: string = "";
    public responsibilities: string[] = [];

    // Setter functions
    // public updateJobTitle(newJob: string) {
    //     this.jobTitle = newJob;
    // }
    // public updateCompany(newCompany: string) {
    //     this.company = newCompany;
    // }
    // public updateStartDate(newDate: string) {
    //     this.startDate = newDate;
    // }
    // public updateEndDate(newDate: string) {
    //     this.endDate = newDate;
    // }
    // public updateSummary(newSummary: string) {
    //     this.jobSummary = newSummary;
    // }
    // public updateResponsibility(newRes: string, index: number) {
    //     this.responsibilities[index] = newRes;
    // }
    // public addResponsibility(newRes: string, index: number) {
    //     this.responsibilities.splice(index, 0, newRes);
    // }
    // public removeResponsibility(index: number) {
    //     this.responsibilities.splice(index, 1);
    // }
    // Getter functions
    // public getJobTitle() {
    //     return this.jobTitle;
    // }
    // public getCompany() {
    //     return this.company;
    // }
    // public getStartDate() {
    //     return this.startDate;
    // }
    // public getEndDate() {
    //     return this.endDate;
    // }
    // public getSummary() {
    //     return this.jobSummary;
    // }
    // public getResponsibility(index: number) {
    //     return this.responsibilities[index];
    // }
};

// Represents info about a single academic credential on the user's resume
class eduObj {
    public degree: string = "";
    public institution: string = "";
    public startDate: string = "";
    public endDate: string = "";
    public gpa: string = "";

    // Setter functions
    // public updateDegree(newDegree: string) {
    //     this.degree = newDegree;
    // }
    // public updateInstitution(newIns: string) {
    //     this.institution = newIns;
    // }
    // public updateStartDate(newDate: string) {
    //     this.startDate = newDate;
    // }
    // public updateEndDate(newDate: string) {
    //     this.endDate = newDate;
    // }
    // public updateGpa(newGpa: string) {
    //     this.gpa = newGpa;
    // }

    // Getter functions
    // public getDegree() {
    //     return this.degree;
    // }
    // public getInstitution() {
    //     return this.institution;
    // }
    // public getStartDate() {
    //     return this.startDate;
    // }
    // public getEndDate() {
    //     return this.endDate;
    // }
    // public getGpa() {
    //     return this.gpa;
    // }
}

// Represents contact info on a single user's resume
class contactObj {
    public email: string[] = [];
    public phone: string[] = [];
    public location: string = "";

    // Setter functions
    // public updateEmail(newEmail: string, index: number) {
    //     this.email[index] = newEmail;
    // }
    // public addEmail(newEmail: string, index: number) {
    //     this.email.splice(index, 0, newEmail);
    // }
    // public removeEmail(index: number) {
    //     this.email.splice(index, 1);
    // }
    // public updatePhone(newPhone: string, index: number) {
    //     this.phone[index] = newPhone;
    // }
    // public addPhone(newPhone: string, index: number) {
    //     this.phone.splice(index, 0, newPhone);
    // }
    // public removePhone(index: number) {
    //     this.phone.splice(index, 1);
    // }
    // public updateLocation(newLoc: string) {
    //     this.location = newLoc;
    // }

    // Getter functions
    // public getEmail(index: number) {
    //     return this.email[index];
    // }
    // public getPhone(index: number) {
    //     return this.phone[index];
    // }
    // public getLocation() {
    //     return this.location;
    // }
}

// Used to store all the info parsed from the user's multiple resumes into a single profile
class resume {
    public fullName: string = "";
    public contact: contactObj = new contactObj;
    public summary: string = "";
    public workExperience: jobObj[] = [];
    public education: eduObj[] = [];
    public skills: string[] = [];

    // Setter functions
    // public updateFullName(newName: string) {
    //     this.fullName = newName;
    // }

    // Contact:
    // User might only want to update 
    // one or two contact info fields 
    // instead of all three of them at once
    // public updateContactEmail(newEmail: string, index: number) {
    //     this.contact.updateEmail(newEmail, index);
    // }
    // public updateContactPhone(newPhone: string, index: number) {
    //     this.contact.updatePhone(newPhone, index);
    // }
    // public updateContactLoc(newLoc: string) {
    //     this.contact.updateLocation(newLoc);
    // }
    // public updateSummary(newSummary: string) {
    //     this.summary = newSummary;
    // }

    // Work experience:
    // Again, the user might only need to edit 
    // a single attribute in one of their jobs 
    // from their resume instead of everything at once
    // public updateJobTitle(newJob: string, jobIdx: number) {
    //     this.workExperience[jobIdx].updateJobTitle(newJob);
    // }
    // public updateCompany(newCompany: string, jobIdx: number) {
    //     this.workExperience[jobIdx].updateCompany(newCompany);
    // }
    // public updateJobStartDate(newStart: string, jobIdx: number) {
    //     this.workExperience[jobIdx].updateStartDate(newStart);
    // }
    // public updateJobEndDate(newEnd: string, jobIdx: number) {
    //     this.workExperience[jobIdx].updateEndDate(newEnd);
    // }
    // public updateJobSummary(newSummary: string, jobIdx: number) {
    //     this.workExperience[jobIdx].updateSummary(newSummary);
    // }
    // public updateResponsibility(newRes: string, jobIdx: number, resIdx: number) {
    //     this.workExperience[jobIdx].updateResponsibility(newRes, resIdx);
    // }
    // public addJob(newJob: jobObj, jobIdx: number) {
    //     this.workExperience.splice(jobIdx, 0, newJob);
    // }
    // public removeJob(jobIdx: number) {
    //     this.workExperience.splice(jobIdx, 1);
    // }

    // Education:
    // public updateDegree(newDegree: string, eduIdx: number) {
    //     this.education[eduIdx].updateDegree(newDegree);
    // }
    // public updateInstitution(newIns: string, eduIdx: number) {
    //     this.education[eduIdx].updateInstitution(newIns);
    // }
    // public updateEduStartDate(newStart: string, eduIdx: number) {
    //     this.education[eduIdx].updateStartDate(newStart);
    // }
    // public updateEduEndDate(newEnd: string, eduIdx: number) {
    //     this.education[eduIdx].updateEndDate(newEnd);
    // }
    // public updateGpa(newGpa: string, eduIdx: number) {
    //     this.education[eduIdx].updateGpa(newGpa);
    // }
    // public addEdu(newEdu: eduObj, eduIdx: number) {
    //     this.education.splice(eduIdx, 0, newEdu);
    // }
    // public removeEdu(eduIdx: number) {
    //     this.education.splice(eduIdx, 1);
    // }

    // Skills:
    // public updateSkill(newSkill: string, skillIdx: number) {
    //     this.skills[skillIdx] = newSkill;
    // }

    // Getter functions
    // public getFullName() {
    //     return this.fullName;
    // }
    // public getContactEmail(index: number) {
    //     return this.contact.getEmail(index);
    // }
    // public getContactPhone(index: number) {
    //     return this.contact.getPhone(index);
    // }
    // public getContactLoc() {
    //     return this.contact.getLocation();
    // }
    // public getSummary() {
    //     return this.summary;
    // }
    // Work experience:
    // public getJobTitle(jobIdx: number) {
    //     return this.workExperience[jobIdx].getJobTitle();
    // }
    // public getCompany(jobIdx: number) {
    //     this.workExperience[jobIdx].getCompany();
    // }
    // public getJobStartDate(jobIdx: number) {
    //     this.workExperience[jobIdx].getStartDate();
    // }
    // public getJobEndDate(jobIdx: number) {
    //     this.workExperience[jobIdx].getEndDate();
    // }
    // public getJobSummary(jobIdx: number) {
    //     this.workExperience[jobIdx].getSummary();
    // }
    // public getResponsibility(jobIdx: number, resIdx: number) {
    //     this.workExperience[jobIdx].getResponsibility(resIdx);
    // }
    // Education:
    // public getDegree(eduIdx: number) {
    //     return this.education[eduIdx].getDegree();
    // }
    // public getInstitution(eduIdx: number) {
    //     return this.education[eduIdx].getInstitution();
    // }
    // public getEduStartDate(eduIdx: number) {
    //     return this.education[eduIdx].getStartDate();
    // }
    // public getEduEndDate(eduIdx: number) {
    //     return this.education[eduIdx].getEndDate();
    // }
    // public getGpa(eduIdx: number) {
    //     return this.education[eduIdx].getGpa();
    // }
    // Skills:
    // public getSkill(skillIdx: number) {
    //     return this.skills[skillIdx];
    // }
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
    
    // Setter functions
    // public updateText(newText: string) {
    //     this.text = newText;
    // }
    // public updateLabel(newLabel: string) {
    //     this.label = newLabel;
    // }
    // public updateDate(newDate: Timestamp) {
    //     this.dateSubmitted = newDate;
    // }

    // Getter functions
    // public getText() {
    //     return this.text;
    // }
    // public getLabel() {
    //     return this.label;
    // }
    // public getDate() {
    //     return this.dateSubmitted;
    // }
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