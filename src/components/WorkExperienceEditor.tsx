import React from 'react';

interface Job {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface WorkExperienceEditorProps {
  workExperience: Job[];
  onChange: (newWorkExperience: Job[]) => void;
}

const WorkExperienceEditor: React.FC<WorkExperienceEditorProps> = ({ workExperience, onChange }) => {

  const updateJob = (index: number, field: keyof Job, value: string) => {
    const updated = [...workExperience];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addJob = () => {
    onChange([...workExperience, { company: '', role: '', startDate: '', endDate: '', description: '' }]);
  };

  const removeJob = (index: number) => {
    const updated = workExperience.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      {workExperience.map((job, i) => (
        <div key={i} style={{ border: '1px solid #ccc', padding: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            placeholder="Company"
            value={job.company}
            onChange={(e) => updateJob(i, 'company', e.target.value)}
            style={{ width: '100%', marginBottom: '0.25rem' }}
          />
          <input
            placeholder="Role"
            value={job.role}
            onChange={(e) => updateJob(i, 'role', e.target.value)}
            style={{ width: '100%', marginBottom: '0.25rem' }}
          />
          <input
            placeholder="Start Date"
            value={job.startDate}
            onChange={(e) => updateJob(i, 'startDate', e.target.value)}
            style={{ width: '48%', marginRight: '4%', marginBottom: '0.25rem' }}
          />
          <input
            placeholder="End Date"
            value={job.endDate || ''}
            onChange={(e) => updateJob(i, 'endDate', e.target.value)}
            style={{ width: '48%', marginBottom: '0.25rem' }}
          />
          <textarea
            placeholder="Description"
            value={job.description || ''}
            onChange={(e) => updateJob(i, 'description', e.target.value)}
            style={{ width: '100%', minHeight: '50px' }}
          />
          <button
            type="button"
            onClick={() => removeJob(i)}
            style={{ marginTop: '0.25rem', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addJob}
        style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
      >
        Add Job
      </button>
    </div>
  );
};

export default WorkExperienceEditor;
