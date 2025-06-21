// src/context/profileContext.tsx

"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
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
  parseAndUpdate: (data: Partial<ProfileData>) => Promise<void>;
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

  const parseAndUpdate = async (data: Partial<ProfileData>) => {
    // 1️⃣ Merge into local state
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

    // 2️⃣ Write to Firestore under users/{uid}
    const user = auth.currentUser;
    if (user) {
      const userDoc = doc(db, "users", user.uid);
      await setDoc(userDoc, data, { merge: true });
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, parseAndUpdate }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error(
      "useProfile must be used within <ProfileProvider>"
    );
  }
  return ctx;
}
