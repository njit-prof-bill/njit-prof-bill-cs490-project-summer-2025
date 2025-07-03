import { useRef, useEffect, useState } from "react";

interface SkillsListProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export default function SkillsList({ skills, onChange }: SkillsListProps) {
  const [error, setError] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (focusedIndex !== null && inputRefs.current[focusedIndex]) {
      inputRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, skills.length]);

  const updateSkill = (index: number, value: string) => {
    // Allow user to type any value, but only show error if duplicate exists
    const isDuplicate = skills.some((s, i) => i !== index && s.trim().toLowerCase() === value.trim().toLowerCase());
    if (isDuplicate) {
      setError("Duplicate skill detected. Each skill must be unique.");
    } else {
      setError("");
    }
    const newSkills = [...skills];
    newSkills[index] = value;
    onChange(newSkills);
  };

  const addSkill = (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default to avoid blur before logic runs
    if (e) e.preventDefault();
    // Prevent adding if any skill is empty or there are duplicates
    const hasEmpty = skills.some((s) => s.trim() === "");
    // Check if the currently focused input is a duplicate
    let isCurrentDuplicate = false;
    if (focusedIndex !== null && focusedIndex >= 0 && focusedIndex < skills.length) {
      const currentValue = skills[focusedIndex];
      isCurrentDuplicate = skills.some((s, i) => i !== focusedIndex && s.trim().toLowerCase() === currentValue.trim().toLowerCase());
    }
    if (hasEmpty) {
      setError("Please fill in all skills before adding a new one.");
      return;
    }
    if (isCurrentDuplicate) {
      setError("Duplicate detected in the currently typed skill. Please enter a unique skill.");
      const newSkills = [...skills];
      newSkills[focusedIndex!] = "";
      onChange(newSkills);
      setFocusedIndex(focusedIndex);
      return;
    }
    // If any other duplicate exists, block add but do not reset any input
    const duplicateIdx = skills.findIndex((s, i) => skills.findIndex((x, j) => x.trim().toLowerCase() === s.trim().toLowerCase() && i !== j) !== -1);
    const hasDuplicate = duplicateIdx !== -1;
    if (hasDuplicate) {
      setError("Please remove duplicates before adding a new one.");
      return;
    }
    setError("");
    onChange([...skills, ""]);
    setFocusedIndex(skills.length); // focus the new input
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
      {skills.map((skill, idx) => {
        const isDuplicate = skills.some((s, i) => i !== idx && s.trim().toLowerCase() === skill.trim().toLowerCase());
        return (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <input
                ref={el => { inputRefs.current[idx] = el; }}
                type="text"
                value={skill}
                onChange={(e) => updateSkill(idx, e.target.value)}
                onFocus={() => setFocusedIndex(idx)}
                onBlur={() => setFocusedIndex((prev) => (prev === idx ? null : prev))}
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
            {isDuplicate && focusedIndex === idx && (
              <div className="text-red-400 text-sm ml-1">Duplicate skill detected. Each skill must be unique.</div>
            )}
          </div>
        );
      })}

      <button
        onMouseDown={addSkill}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Add Skill
      </button>
    </div>
  );
}
