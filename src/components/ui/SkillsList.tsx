interface SkillsListProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export default function SkillsList({ skills, onChange }: SkillsListProps) {
  const addSkill = () => onChange([...skills, ""]);

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    onChange(newSkills);
  };

  const removeSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    onChange(newSkills);
  };

  return (
    <div className="space-y-4 p-6 rounded-lg bg-gray-800 text-white shadow-md">
      <h3 className="text-xl font-semibold mb-2">Skills</h3>

      {skills.map((skill, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            type="text"
            value={skill}
            onChange={(e) => updateSkill(idx, e.target.value)}
            className="flex-grow border border-gray-600 rounded bg-gray-600 text-white px-3 py-2"
            placeholder="Enter skill"
          />
          <button
            onClick={() => removeSkill(idx)}
            className="text-red-400 hover:text-red-300 text-xl"
            aria-label="Remove skill"
          >
            &times;
          </button>
        </div>
      ))}

      <button
        onClick={addSkill}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Add Skill
      </button>
    </div>
  );
}
