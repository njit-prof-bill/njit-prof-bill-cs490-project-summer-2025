interface Education {
  school: string;
  degree?: string;
  certificateOrDiploma?: string;
  datesAttended?: string;
  GPA?: string;
}

interface EducationListProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export default function EducationList({
  education,
  onChange,
}: EducationListProps) {
  const addEducation = () =>
    onChange([
      ...education,
      { school: "", degree: "", certificateOrDiploma: "", datesAttended: "", GPA: "" },
    ]);

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    onChange(newEducation);
  };

  const removeEducation = (index: number) => {
    const newEducation = education.filter((_, i) => i !== index);
    onChange(newEducation);
  };

  const moveEducation = (from: number, to: number) => {
    if (to < 0 || to >= education.length) return;
    const newEducation = [...education];
    const [moved] = newEducation.splice(from, 1);
    newEducation.splice(to, 0, moved);
    onChange(newEducation);
  };

  return (
    <div className="space-y-4 p-6 rounded-lg bg-gray-800 text-white shadow-md">
      <h3 className="text-xl font-semibold mb-2">Education</h3>
      {education.map((edu, idx) => (
        <div key={idx} className="space-y-2 border border-gray-600 p-4 rounded bg-gray-700">
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => moveEducation(idx, idx - 1)}
              disabled={idx === 0}
              className="text-gray-400 hover:text-gray-200 text-xl"
              aria-label="Move up"
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={() => moveEducation(idx, idx + 1)}
              disabled={idx === education.length - 1}
              className="text-gray-400 hover:text-gray-200 text-xl"
              aria-label="Move down"
              title="Move down"
            >
              ↓
            </button>
          </div>
          <label className="block">
            School Name:
            <input
              type="text"
              value={edu.school}
              onChange={(e) => updateEducation(idx, "school", e.target.value)}
              className="mt-1 block w-full border border-gray-600 rounded bg-gray-600 text-white px-3 py-2"
              placeholder="School name"
            />
          </label>
          <label className="block">
            Degree:
            <input
              type="text"
              value={edu.degree || ""}
              onChange={(e) => updateEducation(idx, "degree", e.target.value)}
              className="mt-1 block w-full border border-gray-600 rounded bg-gray-600 text-white px-3 py-2"
              placeholder="Degree (optional)"
            />
          </label>
          <label className="block">
            Diploma/Certificate:
            <input
              type="text"
              value={edu.certificateOrDiploma || ""}
              onChange={(e) => updateEducation(idx, "certificateOrDiploma", e.target.value)}
              className="mt-1 block w-full border border-gray-600 rounded bg-gray-600 text-white px-3 py-2"
              placeholder="Diploma or Certificate (optional)"
            />
          </label>
          <label className="block">
            Dates Attended:
            <input
              type="text"
              value={edu.datesAttended || ""}
              onChange={(e) => updateEducation(idx, "datesAttended", e.target.value)}
              className="mt-1 block w-full border border-gray-600 rounded bg-gray-600 text-white px-3 py-2"
              placeholder="e.g. 2015 - 2019"
            />
          </label>
          <label className="block">
            GPA:
            <input
              type="text"
              value={edu.GPA || ""}
              onChange={(e) => updateEducation(idx, "GPA", e.target.value)}
              className="mt-1 block w-full border border-gray-600 rounded bg-gray-600 text-white px-3 py-2"
              placeholder="GPA (optional)"
            />
          </label>

          <button
            onClick={() => removeEducation(idx)}
            className="mt-1 text-red-400 hover:text-red-300"
          >
            Remove Education
          </button>
        </div>
      ))}

      <button
        onClick={addEducation}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Add Education
      </button>
    </div>
  );
}
