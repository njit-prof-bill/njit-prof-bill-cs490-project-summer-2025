interface SkillsListProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export default function SkillsList({ skills, onChange }: SkillsListProps) {
  const addSkill = () => {
    // Prevent adding empty or duplicate skill
    if (skills.includes("") || skills.some((s, i) => skills.indexOf(s) !== i)) return;
    onChange([...skills, ""]);
  };

  const updateSkill = (index: number, value: string) => {
    // Prevent duplicate skill values
    if (skills.some((s, i) => i !== index && s.trim().toLowerCase() === value.trim().toLowerCase())) return;
    const newSkills = [...skills];
    newSkills[index] = value;
    onChange(newSkills);
  };

  const removeSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    onChange(newSkills);
  };

  const moveSkill = (from: number, to: number) => {
    if (to < 0 || to >= skills.length) return;
    const newSkills = [...skills];
    const [moved] = newSkills.splice(from, 1);
    newSkills.splice(to, 0, moved);
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
          <button
            onClick={() => moveSkill(idx, idx - 1)}
            disabled={idx === 0}
            className="text-gray-400 hover:text-gray-200 text-xl"
            aria-label="Move up"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={() => moveSkill(idx, idx + 1)}
            disabled={idx === skills.length - 1}
            className="text-gray-400 hover:text-gray-200 text-xl"
            aria-label="Move down"
            title="Move down"
          >
            ↓
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
