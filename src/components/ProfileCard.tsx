// // import { useState, useEffect } from 'react';
// // import { doc, getDoc } from 'firebase/firestore';
// // import { firestore } from '../lib/firebase';

// // import { onAuthStateChanged, User } from 'firebase/auth';
// // import { auth, db } from '@/lib/firebase';

// // import Reorder from '../components/Reorder';
// // import ReorderEducation from '../components/ReorderEducation';
// // import ReorderWorkExperience from '@/components/ReorderWorkExperience';
// // import FetchAndDisplayKey from "../components/FetchAndDisplayKey";
// // import SkillsEditor from '../components/SkillsEditor';
// // import EducationEditor from '../components/EducationEditor';
// // import WorkExperienceEditor from './WorkExperienceEditor';
// // import WorkExperienceDisplay from '@/components/WorkExperienceDisplay';
// // import EducationDisplay from '@/components/EducationDisplay';
// // import SummaryDisplay from '@/components/SummaryDisplay';
// // import SummaryEditor from '@/components/SummaryEditor';


// // // Add prop type
// // interface ProfileCardProps {
// //   deduplicateSkills: (skills: string[]) => string[];
// // }

// // export default function UserProfile({ deduplicateSkills }: ProfileCardProps) {
// //   return (
// //     <div>
// //       <FetchAndDisplayKey keyPath="fullName" />
// //       <FetchAndDisplayKey keyPath="contact.email" />
// //       <FetchAndDisplayKey keyPath="contact.phone" />
// //       <br />
// //       {/* <FetchAndDisplayKey keyPath="summary" /> */}

// //       <SummaryDisplay className="your-custom-classes" />
// //       <SummaryEditor  />
// //       <br />


// //       {/* <FetchAndDisplayKey keyPath="workExperience" /> */}
// //       {/* <WorkExperienceDisplay /> */}
// //       {/* <WorkExperienceDisplay className="my-8" /> */}
// //       <ReorderWorkExperience />

// //       <WorkExperienceEditor 
// //       onSuccess={() => console.log('Work experience saved!')}
// //       onError={(error) => console.error('Error:', error)}
// //       />


// //       {/* <FetchAndDisplayKey keyPath="education" /> */}
// //       <ReorderEducation/>
// //       {/* <EducationDisplay /> */}
// //       <EducationEditor />



// //       {/* <FetchAndDisplayKey keyPath="skills" /> */}
// //       <Reorder tag="skills" />
// //       <SkillsEditor
// //         deduplicateSkills={deduplicateSkills} // Pass prop
// //         onSuccess={() => console.log('Skills saved!')}
// //         onError={(error) => console.error(error)}
// //       />
// //     </div>
// //   );
// // }

// import Reorder from '../components/Reorder';
// import ReorderEducation from '../components/ReorderEducation';
// import ReorderWorkExperience from '@/components/ReorderWorkExperience';
// import FetchAndDisplayKey from "../components/FetchAndDisplayKey";
// import SummaryDisplay from '@/components/SummaryDisplay';
// import SummaryEditor from '@/components/SummaryEditor';
// import SkillsEditor from '../components/SkillsEditor';

// // ✅ Add prop t

// // Add prop type
// interface ProfileCardProps {
//   deduplicateSkills: (skills: string[]) => string[];
// }

// export default function UserProfile({ deduplicateSkills }: ProfileCardProps) {
//   return (
//     <div>
//       <FetchAndDisplayKey keyPath="fullName" />
//       <FetchAndDisplayKey keyPath="contact.email" />
//       <FetchAndDisplayKey keyPath="contact.phone" />
//       <br />
//       {/* <FetchAndDisplayKey keyPath="summary" /> */}

//       <div className="w-full max-w-4xl mx-auto mt-6">
//         <h2 className="text-2xl font-bold mb-4">Summary/Career Objective</h2>
//         <SummaryDisplay className="p-6 bg-[#1B1917] border border-gray-700 rounded-lg shadow-sm" />
//         <div className="mt-4">
//           <SummaryEditor />
//         </div>
//       </div>



//       <br />


//       {/* <FetchAndDisplayKey keyPath="workExperience" /> */}
//       {/* <WorkExperienceDisplay /> */}
//       {/* <WorkExperienceDisplay className="my-8" /> */}
//       <ReorderWorkExperience />

//       {/* <WorkExperienceEditor 
//       onSuccess={() => console.log('Work experience saved!')}
//       onError={(error) => console.error('Error:', error)}
//       /> */}


//       {/* <FetchAndDisplayKey keyPath="education" /> */}
//       <ReorderEducation/>
//       {/* <EducationDisplay /> */}
//       {/* <EducationEditor /> */}



//       {/* <FetchAndDisplayKey keyPath="skills" /> */}
//       <div className="w-full max-w-4xl mx-auto mt-10">
//         <Reorder tag="skills" deduplicateSkills={deduplicateSkills} />

//       </div>
//       {/* <SkillsEditor
//         deduplicateSkills={deduplicateSkills} // Pass prop
//         onSuccess={() => console.log('Skills saved!')}
//         onError={(error) => console.error(error)}
//       /> */}
//     </div>
//   );
// }

import { useState } from 'react';
import Reorder from '../components/Reorder';
import ReorderEducation from '../components/ReorderEducation';
import ReorderWorkExperience from '@/components/ReorderWorkExperience';
import FetchAndDisplayKey from "../components/FetchAndDisplayKey";
import SummaryDisplay from '@/components/SummaryDisplay';
import SummaryEditor from '@/components/SummaryEditor';

interface ProfileCardProps {
  deduplicateSkills: (skills: string[]) => string[];
}

export default function UserProfile({ deduplicateSkills }: ProfileCardProps) {
  const [activeTab, setActiveTab] = useState("contact");

  const tabLabels: { [key: string]: string } = {
    contact: "Contact Info",
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Tab Navigation */}
      <div className="relative z-10 flex space-x-4 bg-[#1B1917] rounded-t-xl px-4 pt-4 -mb-px">
        {Object.keys(tabLabels).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium transition-all duration-200 rounded-t-md ${
              activeTab === tab
                ? "bg-[#2A2A2E] text-[#F09E38]"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Tab Panel Container */}
      <div className="relative min-h-[300px] bg-[#2A2A2E] rounded-b-xl p-6 transition-all duration-300">
        {activeTab === "contact" && (
          <div className="animate-fade-in space-y-4">
            <FetchAndDisplayKey keyPath="fullName" />
            <FetchAndDisplayKey keyPath="contact.email" />
            <FetchAndDisplayKey keyPath="contact.phone" />
          </div>
        )}

        {activeTab === "summary" && (
          <div className="animate-fade-in w-full max-w-4xl mx-auto mt-2">
            <h2 className="text-2xl font-bold mb-4 text-white">Summary/Career Objective</h2>
            <SummaryDisplay className="p-6 bg-[#1B1917] border border-gray-700 rounded-lg shadow-sm" />
            <div className="mt-4">
              <SummaryEditor />
            </div>
          </div>
        )}

        {activeTab === "experience" && (
          <div className="animate-fade-in mt-2">
            <ReorderWorkExperience />
          </div>
        )}

        {activeTab === "education" && (
          <div className="animate-fade-in mt-2">
            <ReorderEducation />
          </div>
        )}

        {activeTab === "skills" && (
          <div className="animate-fade-in w-full max-w-4xl mx-auto mt-2">
            <Reorder tag="skills" />
          </div>
        )}
      </div>
    </div>
  );
}