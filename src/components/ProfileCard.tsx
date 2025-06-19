import Reorder from '../components/Reorder';
import ReorderEducation from '../components/ReorderEducation';
import ReorderWorkExperience from '@/components/ReorderWorkExperience';
import FetchAndDisplayKey from "../components/FetchAndDisplayKey";
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

      <div className="w-full max-w-4xl mx-auto mt-6">
        <h2 className="text-2xl font-bold mb-4">Summary/Career Objective</h2>
        <SummaryDisplay className="p-6 bg-[#1B1917] border border-gray-700 rounded-lg shadow-sm" />
        <div className="mt-4">
          <SummaryEditor />
        </div>
      </div>



      <br />


      {/* <FetchAndDisplayKey keyPath="workExperience" /> */}
      {/* <WorkExperienceDisplay /> */}
      {/* <WorkExperienceDisplay className="my-8" /> */}
      <ReorderWorkExperience />

      {/* <WorkExperienceEditor 
      onSuccess={() => console.log('Work experience saved!')}
      onError={(error) => console.error('Error:', error)}
      /> */}


      {/* <FetchAndDisplayKey keyPath="education" /> */}
      <ReorderEducation/>
      {/* <EducationDisplay /> */}
      {/* <EducationEditor /> */}



      {/* <FetchAndDisplayKey keyPath="skills" /> */}
      <div className="w-full max-w-4xl mx-auto mt-10">
        <Reorder tag="skills" />
      </div>
      {/* <SkillsEditor
        deduplicateSkills={deduplicateSkills} // Pass prop
        onSuccess={() => console.log('Skills saved!')}
        onError={(error) => console.error(error)}
      /> */}
    </div>
  );
}
