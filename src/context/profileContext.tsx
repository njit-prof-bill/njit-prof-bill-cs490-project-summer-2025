// src/context/profileContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export interface ContactInfo {
  email: string;
  phone: string;
  additionalEmails?: string[];
  additionalPhones?: string[];
}

export interface JobEntry {
  id: string;
  company: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  accomplishments: string[];
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  dates: string;
  gpa?: string;
}

export interface ProfileData {
  contactInfo: ContactInfo;
  careerObjective: string;
  skills: string[];
  jobHistory: JobEntry[];
  education: EducationEntry[];
}

type ProfileContextType = {
  profile: ProfileData;
  hasUnsavedChanges: boolean;
  updateContactInfo: (ci: Partial<ContactInfo>) => void;
  updateCareerObjective: (obj: string) => void;
  updateSkills: (skills: string[]) => void;
  addJobEntry: (job: Omit<JobEntry, "id">) => void;
  updateJobEntry: (id: string, job: Partial<JobEntry>) => void;
  deleteJobEntry: (id: string) => void;
  addEducationEntry: (edu: Omit<EducationEntry, "id">) => void;
  updateEducationEntry: (
    id: string,
    edu: Partial<EducationEntry>
  ) => void;
  deleteEducationEntry: (id: string) => void;
  parseAndUpdateProfile: (data: Partial<ProfileData>) => void;
  markUnsaved: () => void;
  saveChanges: () => Promise<void>;
};

const initialProfile: ProfileData = {
  contactInfo: { email: "", phone: "" },
  careerObjective: "",
  skills: [],
  jobHistory: [],
  education: [],
};

const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined
);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const markUnsaved = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const updateContactInfo = useCallback(
    (ci: Partial<ContactInfo>) => {
      setProfile((prev) => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, ...ci },
      }));
      markUnsaved();
    },
    [markUnsaved]
  );

  const updateCareerObjective = useCallback(
    (obj: string) => {
      setProfile((prev) => ({ ...prev, careerObjective: obj }));
      markUnsaved();
    },
    [markUnsaved]
  );

  const updateSkills = useCallback(
    (skills: string[]) => {
      setProfile((prev) => ({ ...prev, skills }));
      markUnsaved();
    },
    [markUnsaved]
  );

  const addJobEntry = useCallback(
    (job: Omit<JobEntry, "id">) => {
      const entry: JobEntry = { ...job, id: Date.now().toString() };
      setProfile((prev) => ({
        ...prev,
        jobHistory: [...prev.jobHistory, entry],
      }));
      markUnsaved();
    },
    [markUnsaved]
  );

  const updateJobEntry = useCallback(
    (id: string, job: Partial<JobEntry>) => {
      setProfile((prev) => ({
        ...prev,
        jobHistory: prev.jobHistory.map((j) =>
          j.id === id ? { ...j, ...job } : j
        ),
      }));
      markUnsaved();
    },
    [markUnsaved]
  );

  const deleteJobEntry = useCallback(
    (id: string) => {
      setProfile((prev) => ({
        ...prev,
        jobHistory: prev.jobHistory.filter((j) => j.id !== id),
      }));
      markUnsaved();
    },
    [markUnsaved]
  );

  const addEducationEntry = useCallback(
    (edu: Omit<EducationEntry, "id">) => {
      const entry: EducationEntry = { ...edu, id: Date.now().toString() };
      setProfile((prev) => ({
        ...prev,
        education: [...prev.education, entry],
      }));
      markUnsaved();
    },
    [markUnsaved]
  );

  const updateEducationEntry = useCallback(
    (id: string, edu: Partial<EducationEntry>) => {
      setProfile((prev) => ({
        ...prev,
        education: prev.education.map((e) =>
          e.id === id ? { ...e, ...edu } : e
        ),
      }));
      markUnsaved();
    },
    [markUnsaved]
  );

  const deleteEducationEntry = useCallback(
    (id: string) => {
      setProfile((prev) => ({
        ...prev,
        education: prev.education.filter((e) => e.id !== id),
      }));
      markUnsaved();
    },
    [markUnsaved]
  );

  const parseAndUpdateProfile = useCallback(
    (data: Partial<ProfileData>) => {
      setProfile((prev) => ({
        contactInfo: {
          ...prev.contactInfo,
          ...data.contactInfo,
        },
        careerObjective:
          data.careerObjective ?? prev.careerObjective,
        skills: data.skills ?? prev.skills,
        jobHistory: data.jobHistory ?? prev.jobHistory,
        education: data.education ?? prev.education,
      }));
      markUnsaved();
    },
    [markUnsaved]
  );

  const saveChanges = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    const userDoc = doc(db, "users", user.uid);
    await setDoc(userDoc, profile, { merge: true });
    setHasUnsavedChanges(false);
  }, [profile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        hasUnsavedChanges,
        updateContactInfo,
        updateCareerObjective,
        updateSkills,
        addJobEntry,
        updateJobEntry,
        deleteJobEntry,
        addEducationEntry,
        updateEducationEntry,
        deleteEducationEntry,
        parseAndUpdateProfile,
        markUnsaved,
        saveChanges,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error(
      "useProfile must be used within a <ProfileProvider>"
    );
  }
  return ctx;
}
