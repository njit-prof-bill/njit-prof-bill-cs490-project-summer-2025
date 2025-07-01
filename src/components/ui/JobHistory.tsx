interface Job {
  company: string;
  jobTitle: string;
  responsibilities?: string;
  startDate?: string;
  endDate?: string;
  accomplishments?: string[];
}

interface JobHistoryProps {
  jobs: Job[];
  onChange: (jobs: Job[]) => void;
}

export default function JobHistory({ jobs, onChange }: JobHistoryProps) {
  const addJob = () =>
    onChange([
      ...jobs,
      {
        company: "",
        jobTitle: "",
        responsibilities: "",
        startDate: "",
        endDate: "",
        accomplishments: [""],
      },
    ]);

  const updateJobField = (index: number, field: keyof Job, value: any) => {
    const newJobs = [...jobs];
    newJobs[index] = { ...newJobs[index], [field]: value };
    onChange(newJobs);
  };

  const updateAccomplishment = (
    jobIndex: number,
    accIndex: number,
    value: string
  ) => {
    const newJobs = [...jobs];
    const accs = newJobs[jobIndex].accomplishments || [];
    accs[accIndex] = value;
    newJobs[jobIndex].accomplishments = accs;
    onChange(newJobs);
  };

  const addAccomplishment = (jobIndex: number) => {
    const newJobs = [...jobs];
    const accs = newJobs[jobIndex].accomplishments || [];
    newJobs[jobIndex].accomplishments = [...accs, ""];
    onChange(newJobs);
  };

  const removeAccomplishment = (jobIndex: number, accIndex: number) => {
    const newJobs = [...jobs];
    const accs = newJobs[jobIndex].accomplishments || [];
    newJobs[jobIndex].accomplishments = accs.filter((_, i) => i !== accIndex);
    onChange(newJobs);
  };

  const removeJob = (index: number) => {
    const newJobs = jobs.filter((_, i) => i !== index);
    onChange(newJobs);
  };

  const moveJob = (from: number, to: number) => {
    if (to < 0 || to >= jobs.length) return;
    const newJobs = [...jobs];
    const [moved] = newJobs.splice(from, 1);
    newJobs.splice(to, 0, moved);
    onChange(newJobs);
  };

  return (
    <div className="space-y-6 p-6 rounded-lg bg-gray-800 text-white shadow-md">
      <h3 className="text-xl font-semibold mb-2">Job History</h3>
      {jobs.map((job, idx) => (
        <div key={idx} className="space-y-2 border-b border-gray-700 pb-4 mb-4">
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => moveJob(idx, idx - 1)}
              disabled={idx === 0}
              className="text-gray-400 hover:text-gray-200 text-xl"
              aria-label="Move up"
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={() => moveJob(idx, idx + 1)}
              disabled={idx === jobs.length - 1}
              className="text-gray-400 hover:text-gray-200 text-xl"
              aria-label="Move down"
              title="Move down"
            >
              ↓
            </button>
          </div>
          <label className="block">
            Company Name:
            <input
              type="text"
              value={job.company}
              onChange={(e) =>
                updateJobField(idx, "company", e.target.value)
              }
              className="mt-1 block w-full border border-gray-600 rounded bg-gray-600 text-white px-3 py-2"
              placeholder="Company name"
            />
          </label>
          <label className="block">
            Job Title:
            <input
              type="text"
              value={job.jobTitle}
              onChange={(e) =>
                updateJobField(idx, "jobTitle", e.target.value)
              }
              className="mt-1 block w-full border border-gray-600 rounded bg-gray-600 text-white px-3 py-2"
              placeholder="Job title"
            />
          </label>
          <label className="block">
            Role Summary:
            <textarea
              value={job.responsibilities || ""}
              onChange={(e) =>
                updateJobField(idx, "responsibilities", e.target.value)
              }
              className="mt-1 block w-full border border-gray-600 rounded bg-gray-600 text-white px-3 py-3"
              placeholder="Brief summary"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              Start Date:
              <input
                type="text"
                value={job.startDate || ""}
                onChange={(e) =>
                  updateJobField(idx, "startDate", e.target.value)
                }
                className="mt-1 block w-full border border-gray-600 rounded bg-gray-600 text-white px-3 py-2"
                placeholder="e.g. Jan 2020"
              />
            </label>
            <label className="block">
              End Date:
              <input
                type="text"
                value={job.endDate || ""}
                onChange={(e) =>
                  updateJobField(idx, "endDate", e.target.value)
                }
                className="mt-1 block w-full border border-gray-600 rounded bg-gray-600 text-white px-3 py-2"
                placeholder="e.g. Present"
              />
            </label>
          </div>

          <div>
            <h4 className="font-semibold">Accomplishments:</h4>
            {job.accomplishments?.map((acc, aidx) => (
              <div key={aidx} className="flex gap-2 items-center mt-1">
                <input
                  type="text"
                  value={acc}
                  onChange={(e) =>
                    updateAccomplishment(idx, aidx, e.target.value)
                  }
                  className="flex-grow border border-gray-600 rounded bg-gray-600 text-white px-3 py-2"
                  placeholder="Accomplishment"
                />
                <button
                  onClick={() => removeAccomplishment(idx, aidx)}
                  className="text-red-400 hover:text-red-300 text-xl"
                  aria-label="Remove accomplishment"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              onClick={() => addAccomplishment(idx)}
              className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Add Accomplishment
            </button>
          </div>

          <button
            onClick={() => removeJob(idx)}
            className="mt-3 text-red-400 hover:text-red-300"
          >
            Remove Job
          </button>
        </div>
      ))}

      <button
        onClick={addJob}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Add Job
      </button>
    </div>
  );
}
