import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

import Reorder from '../components/Reorder';
import ReorderEducation from '../components/ReorderEducation';
import ReorderWorkExperience from '@/components/ReorderWorkExperience';
import FetchAndDisplayKey from "../components/FetchAndDisplayKey";
import SkillsEditor from '../components/SkillsEditor';
import EducationEditor from '../components/EducationEditor';
import WorkExperienceEditor from './WorkExperienceEditor';
import WorkExperienceDisplay from '@/components/WorkExperienceDisplay';
import EducationDisplay from '@/components/EducationDisplay';
import SummaryDisplay from '@/components/SummaryDisplay';
import SummaryEditor from '@/components/SummaryEditor';


// Add prop type
interface ProfileCardProps {
  deduplicateSkills: (skills: string[]) => string[];
}

export default function UserProfile({ deduplicateSkills }: ProfileCardProps) {
  return (
    <div>
      <FetchAndDisplayKey keyPath="fullName" />
      <FetchAndDisplayKey keyPath="contact.email" />
      <FetchAndDisplayKey keyPath="contact.phone" />
      <br />
      {/* <FetchAndDisplayKey keyPath="summary" /> */}

      <SummaryDisplay className="your-custom-classes" />
      <SummaryEditor  />
      <br />


      {/* <FetchAndDisplayKey keyPath="workExperience" /> */}
      {/* <WorkExperienceDisplay /> */}
      {/* <WorkExperienceDisplay className="my-8" /> */}
      <ReorderWorkExperience />

      <WorkExperienceEditor 
      onSuccess={() => console.log('Work experience saved!')}
      onError={(error) => console.error('Error:', error)}
      />


      {/* <FetchAndDisplayKey keyPath="education" /> */}
      <ReorderEducation/>
      {/* <EducationDisplay /> */}
      <EducationEditor />



      {/* <FetchAndDisplayKey keyPath="skills" /> */}
      <Reorder tag="skills" />
      <SkillsEditor
        deduplicateSkills={deduplicateSkills} // Pass prop
        onSuccess={() => console.log('Skills saved!')}
        onError={(error) => console.error(error)}
      />
    </div>
  );
}
