// import { useState, useEffect } from 'react';
// import { doc, getDoc } from 'firebase/firestore';
// import { firestore } from '../lib/firebase';
// import { onAuthStateChanged, User } from 'firebase/auth';
// import { auth, db } from '@/lib/firebase'; // Adjust path as needed
// // import { doc, getDoc, setDoc } from 'firebase/firestore';
// // import { onAuthStateChanged, User } from 'firebase/auth';
// import FetchAndDisplayKey from "../components/FetchAndDisplayKey";
// import SkillsEditor from '../components/SkillsEditor';
// import EducationEditor from '../components/EducationEditor';


// export default function UserProfile() {


//     // console.log("ASHDAHSDIAISHDsdfsdfs");



//   return (
//     <div>
     


//     <FetchAndDisplayKey keyPath="fullName" /> 

//     <FetchAndDisplayKey keyPath="contact.email" />

  
//     <FetchAndDisplayKey keyPath="contact.phone" />

//     <br />
//     <FetchAndDisplayKey keyPath="summary" />
//     <br />

   
//   <FetchAndDisplayKey keyPath="workExperience" />
//     {/* <FetchAndDisplayKey keyPath="experience" /> */}

//     <FetchAndDisplayKey keyPath="education" />

//     <EducationEditor />

// {/* 
//     <FetchAndDisplayKey keyPath="skills.0" />
//     <FetchAndDisplayKey keyPath="skills.1" /> */}

//     <FetchAndDisplayKey keyPath="skills" />
//     <SkillsEditor 
//   onSuccess={() => console.log('Skills saved!')}
//   onError={(error) => console.error(error)}
// />




//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

import FetchAndDisplayKey from "../components/FetchAndDisplayKey";
import SkillsEditor from '../components/SkillsEditor';
import EducationEditor from '../components/EducationEditor';
import WorkExperienceEditor from './WorkExperienceEditor';
import WorkExperienceDisplay from '@/components/WorkExperienceDisplay';
import EducationDisplay from '@/components/EducationDisplay';



// ✅ Add prop type
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
      <FetchAndDisplayKey keyPath="summary" />
      <br />


      {/* <FetchAndDisplayKey keyPath="workExperience" /> */}
      {/* <WorkExperienceDisplay /> */}
      <WorkExperienceDisplay className="my-8" />
      <WorkExperienceEditor 
      onSuccess={() => console.log('Work experience saved!')}
      onError={(error) => console.error('Error:', error)}
      />

      {/* <FetchAndDisplayKey keyPath="education" /> */}
      <EducationDisplay />
      <EducationEditor />

      <FetchAndDisplayKey keyPath="skills" />
      <SkillsEditor 
        deduplicateSkills={deduplicateSkills} // ✅ Pass prop
        onSuccess={() => console.log('Skills saved!')}
        onError={(error) => console.error(error)}
      />
    </div>
  );
}
