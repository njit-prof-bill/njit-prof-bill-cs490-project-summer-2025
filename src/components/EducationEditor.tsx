import React from 'react';

interface EducationItem {
  degree: string;
  institution: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

interface EducationEditorProps {
  education: EducationItem[];
  onChange: (newEducation: EducationItem[]) => void;
}

const EducationEditor: React.FC<EducationEditorProps> = ({ education, onChange }) => {

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addEducation = () => {
    onChange([...education, { degree: '', institution: '', startDate: '', endDate: '', gpa: '' }]);
  };

  const removeEducation = (index: number) => {
    const updated = education.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      {education.map((edu, i) => (
        <div key={i} style={{ border: '1px solid #ccc', padding: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            placeholder="Institution"
            value={edu.institution}
            onChange={(e) => updateEducation(i, 'institution', e.target.value)}
            style={{ width: '100%', marginBottom: '0.25rem' }}
          />
          <input
            placeholder="Degree"
            value={edu.degree}
            onChange={(e) => updateEducation(i, 'degree', e.target.value)}
            style={{ width: '100%', marginBottom: '0.25rem' }}
          />
          <input
            placeholder="Start Date"
            value={edu.startDate}
            onChange={(e) => updateEducation(i, 'startDate', e.target.value)}
            style={{ width: '48%', marginRight: '4%', marginBottom: '0.25rem' }}
          />
          <input
            placeholder="End Date"
            value={edu.endDate || ''}
            onChange={(e) => updateEducation(i, 'endDate', e.target.value)}
            style={{ width: '48%', marginBottom: '0.25rem' }}
          />
          <input
            placeholder="GPA"
            value={edu.gpa || ''}
            onChange={(e) => updateEducation(i, 'gpa', e.target.value)}
            style={{ width: '100%', marginBottom: '0.25rem' }}
          />
          <button
            type="button"
            onClick={() => removeEducation(i)}
            style={{ marginTop: '0.25rem', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addEducation}
        style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
      >
        Add Education
      </button>
    </div>
  );
};

export default EducationEditor;
