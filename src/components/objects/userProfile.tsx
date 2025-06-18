// Represents info about a single job on the user's resume
class jobObj {
    private jobTitle: string = "";
    private company: string = "";
    private startDate: string = "";
    private endDate: string = "";
    private jobSummary: string = "";
    private responsibilities: string[] = [];

    // Setter functions
    public updateJobTitle(newJob: string) {
        this.jobTitle = newJob;
    }
    public updateCompany(newCompany: string) {
        this.company = newCompany;
    }
    public updateStartDate(newDate: string) {
        this.startDate = newDate;
    }
    public updateEndDate(newDate: string) {
        this.endDate = newDate;
    }
    public updateSummary(newSummary: string) {
        this.jobSummary = newSummary;
    }
    public updateResponsibility(newRes: string, index: number) {
        this.responsibilities[index] = newRes;
    }
    public addResponsibility(newRes: string, index: number) {
        this.responsibilities.splice(index, 0, newRes);
    }
    public removeResponsibility(index: number) {
        this.responsibilities.splice(index, 1);
    }
    // Getter functions
    public getJobTitle() {
        return this.jobTitle;
    }
    public getCompany() {
        return this.company;
    }
    public getStartDate() {
        return this.startDate;
    }
    public getEndDate() {
        return this.endDate;
    }
    public getSummary() {
        return this.jobSummary;
    }
    public getResponsibility(index: number) {
        return this.responsibilities[index];
    }
};

// Represents info about a single academic credential on the user's resume
class eduObj {
    private degree: string = "";
    private institution: string = "";
    private startDate: string = "";
    private endDate: string = "";
    private gpa: string = "";

    // Setter functions
    public updateDegree(newDegree: string) {
        this.degree = newDegree;
    }
    public updateInstitution(newIns: string) {
        this.institution = newIns;
    }
    public updateStartDate(newDate: string) {
        this.startDate = newDate;
    }
    public updateEndDate(newDate: string) {
        this.endDate = newDate;
    }
    public updateGpa(newGpa: string) {
        this.gpa = newGpa;
    }

    // Getter functions
    public getDegree() {
        return this.degree;
    }
    public getInstitution() {
        return this.institution;
    }
    public getStartDate() {
        return this.startDate;
    }
    public getEndDate() {
        return this.endDate;
    }
    public getGpa() {
        return this.gpa;
    }
}

// Represents contact info on a single user's resume
class contactObj {
    private email: string[] = [];
    private phone: string[] = [];
    private location: string = "";

    // Setter functions
    public updateEmail(newEmail: string, index: number) {
        this.email[index] = newEmail;
    }
    public addEmail(newEmail: string, index: number) {
        this.email.splice(index, 0, newEmail);
    }
    public removeEmail(index: number) {
        this.email.splice(index, 1);
    }
    public updatePhone(newPhone: string, index: number) {
        this.phone[index] = newPhone;
    }
    public addPhone(newPhone: string, index: number) {
        this.phone.splice(index, 0, newPhone);
    }
    public removePhone(index: number) {
        this.phone.splice(index, 1);
    }
    public updateLocation(newLoc: string) {
        this.location = newLoc;
    }

    // Getter functions
    public getEmail(index: number) {
        return this.email[index];
    }
    public getPhone(index: number) {
        return this.phone[index];
    }
    public getLocation() {
        return this.location;
    }
}

class resume {
    private fullName: string = "";
    private contact: contactObj = new contactObj;
    private summary: string = "";
    private workExperience: jobObj[] = [];
    private education: eduObj[] = [];
    private skills: string[] = [];

    // Setter functions
    public updateFullName(newName: string) {
        this.fullName = newName;
    }

    // Contact:
    // User might only want to update 
    // one or two contact info fields 
    // instead of all three of them at once
    public updateContactEmail(newEmail: string, index: number) {
        this.contact.updateEmail(newEmail, index);
    }
    public updateContactPhone(newPhone: string, index: number) {
        this.contact.updatePhone(newPhone, index);
    }
    public updateContactLoc(newLoc: string) {
        this.contact.updateLocation(newLoc);
    }

    public updateSummary(newSummary: string) {
        this.summary = newSummary;
    }

    // Work experience:
    // Again, the user might only need to edit 
    // a single attribute in one of their jobs 
    // from their resume instead of everything at once
    public updateJobTitle(newJob: string, jobIdx: number) {
        this.workExperience[jobIdx].updateJobTitle(newJob);
    }
    public updateCompany(newCompany: string, jobIdx: number) {
        this.workExperience[jobIdx].updateCompany(newCompany);
    }
    public updateJobStartDate(newStart: string, jobIdx: number) {
        this.workExperience[jobIdx].updateStartDate(newStart);
    }
    public updateJobEndDate(newEnd: string, jobIdx: number) {
        this.workExperience[jobIdx].updateEndDate(newEnd);
    }
    public updateJobSummary(newSummary: string, jobIdx: number) {
        this.workExperience[jobIdx].updateSummary(newSummary);
    }
    public updateResponsibility(newRes: string, jobIdx: number, resIdx: number) {
        this.workExperience[jobIdx].updateResponsibility(newRes, resIdx);
    }
    public addJob(newJob: jobObj, jobIdx: number) {
        this.workExperience.splice(jobIdx, 0, newJob);
    }
    public removeJob(jobIdx: number) {
        this.workExperience.splice(jobIdx, 1);
    }

    // Education:
    public updateDegree(newDegree: string, eduIdx: number) {
        this.education[eduIdx].updateDegree(newDegree);
    }
    public updateInstitution(newIns: string, eduIdx: number) {
        this.education[eduIdx].updateInstitution(newIns);
    }
    public updateEduStartDate(newStart: string, eduIdx: number) {
        this.education[eduIdx].updateStartDate(newStart);
    }
    public updateEduEndDate(newEnd: string, eduIdx: number) {
        this.education[eduIdx].updateEndDate(newEnd);
    }
    public updateGpa(newGpa: string, eduIdx: number) {
        this.education[eduIdx].updateGpa(newGpa);
    }
    public addEdu(newEdu: eduObj, eduIdx: number) {
        this.education.splice(eduIdx, 0, newEdu);
    }
    public removeEdu(eduIdx: number) {
        this.education.splice(eduIdx, 1);
    }

    // Skills:
    public updateSkill(newSkill: string, skillIdx: number) {
        this.skills[skillIdx] = newSkill;
    }

    // Getter functions
    public getFullName() {
        return this.fullName;
    }
    public getContactEmail(index: number) {
        return this.contact.getEmail(index);
    }
    public getContactPhone(index: number) {
        return this.contact.getPhone(index);
    }
    public getContactLoc() {
        return this.contact.getLocation();
    }
    public getSummary() {
        return this.summary;
    }
    // Work experience:
    public getJobTitle(jobIdx: number) {
        return this.workExperience[jobIdx].getJobTitle();
    }
    public getCompany(jobIdx: number) {
        this.workExperience[jobIdx].getCompany();
    }
    public getJobStartDate(jobIdx: number) {
        this.workExperience[jobIdx].getStartDate();
    }
    public getJobEndDate(jobIdx: number) {
        this.workExperience[jobIdx].getEndDate();
    }
    public getJobSummary(jobIdx: number) {
        this.workExperience[jobIdx].getSummary();
    }
    public getResponsibility(jobIdx: number, resIdx: number) {
        this.workExperience[jobIdx].getResponsibility(resIdx);
    }
    // Education:
    public getDegree(eduIdx: number) {
        return this.education[eduIdx].getDegree();
    }
    public getInstitution(eduIdx: number) {
        return this.education[eduIdx].getInstitution();
    }
    public getEduStartDate(eduIdx: number) {
        return this.education[eduIdx].getStartDate();
    }
    public getEduEndDate(eduIdx: number) {
        return this.education[eduIdx].getEndDate();
    }
    public getGpa(eduIdx: number) {
        return this.education[eduIdx].getGpa();
    }
    // Skills:
    public getSkill(skillIdx: number) {
        return this.skills[skillIdx];
    }
}

// For unstructured, biographical text submitted directly by the user.
class freeForm {
    private text: string = "";
    public updateText(newText: string) {
        this.text = newText;
    }
    public getText() {
        return this.text;
    }
}

// The class which I intend to use directly.
export class userProfile {
    // theme property is used by src/context/themeContext.tsx
    theme: string = "system";
    freeFormText: freeForm = new freeForm;
    resumeFields: resume = new resume;
}