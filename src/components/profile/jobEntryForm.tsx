import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useProfile, JobEntry } from '@/context/profileContext';

interface JobEntryFormProps {
  job?: JobEntry | null;
  onClose: () => void;
}

interface JobFormData {
  company: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  accomplishments: string[];
}

const JobEntryForm: React.FC<JobEntryFormProps> = ({ job, onClose }) => {
  const { addJobEntry, updateJobEntry } = useProfile();
  const [accomplishments, setAccomplishments] = useState<string[]>(
    job?.accomplishments || ['']
  );

  const { register, handleSubmit, formState: { errors }, watch } = useForm<JobFormData>({
    defaultValues: {
      company: job?.company || '',
      title: job?.title || '',
      description: job?.description || '',
      startDate: job?.startDate || '',
      endDate: job?.endDate || '',
      accomplishments: job?.accomplishments || [''],
    }
  });

  const isCurrentJob = !watch('endDate');

  const onSubmit = (data: JobFormData) => {
    const jobData = {
      ...data,
      accomplishments: accomplishments.filter(acc => acc.trim() !== ''),
    };

    if (job) {
      updateJobEntry(job.id, jobData);
    } else {
      addJobEntry(jobData);
    }
    onClose();
  };

  const addAccomplishment = () => {
    setAccomplishments([...accomplishments, '']);
  };

  const removeAccomplishment = (index: number) => {
    setAccomplishments(accomplishments.filter((_, i) => i !== index));
  };

  const updateAccomplishment = (index: number, value: string) => {
    const newAccomplishments = [...accomplishments];
    newAccomplishments[index] = value;
    setAccomplishments(newAccomplishments);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-neutral-800 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">
          {job ? 'Edit Job Entry' : 'Add New Job'}
        </h3>
        <button
          onClick={onClose}
          className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Company Name *
            </label>
            <input
              {...register('company', { required: 'Company name is required' })}
              type="text"
              className="bg-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., TechCorp Inc."
            />
            {errors.company && (
              <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Job Title *
            </label>
            <input
              {...register('title', { required: 'Job title is required' })}
              type="text"
              className="bg-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Senior Software Engineer"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className='flex flex-col relative w-full'>
            <label className="block text-sm font-medium text-white mb-2">
              Start Date *
            </label>
            <input
              {...register('startDate', { required: 'Start date is required' })}
              type="month"
              className="bg-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Custom calendar SVG icon */}
            <div className="pointer-events-none absolute right-3 top-10">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="2 0 24 24"
                width="17"
                height="17"
              >
                <path d="M7 10h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                <path
                  fillRule="evenodd"
                  d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 
                  2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1V1h-2v2H8V1H6v2H5zm0 
                  2h14v2H5V5zm0 4h14v10H5V9z"
                />
              </svg>
            </div>

            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              End Date
            </label>
            <input
              {...register('endDate')}
              type="month"
              className="bg-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave empty if current job"
            />

            {/* Custom calendar SVG icon */}
            <div className="pointer-events-none absolute right-27.5 top-159">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 24 24"
                width="17"
                height="17"
              >
                <path d="M7 10h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                <path
                  fillRule="evenodd"
                  d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 
                  2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1V1h-2v2H8V1H6v2H5zm0 
                  2h14v2H5V5zm0 4h14v10H5V9z"
                />
              </svg>
            </div>

            {isCurrentJob && (
              <p className="mt-1 text-sm text-green-600">Current position</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Job Description *
          </label>
          <textarea
            {...register('description', { required: 'Job description is required' })}
            rows={4}
            className="bg-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Describe your role, responsibilities, and key activities..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-white">
              Key Accomplishments
            </label>
            <button
              type="button"
              onClick={addAccomplishment}
              className="flex items-center space-x-1 text-blue-400 hover:text-white-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Accomplishment</span>
            </button>
          </div>
          
          <div className="space-y-2">
            {accomplishments.map((accomplishment, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={accomplishment}
                  onChange={(e) => updateAccomplishment(index, e.target.value)}
                  className="bg-black flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Increased team productivity by 25%"
                />
                {accomplishments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAccomplishment(index)}
                    className="p-2 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-1 text-sm text-white">
            Add specific achievements, metrics, and impact you made in this role
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-white border border-gray-300 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{job ? 'Update Job' : 'Add Job'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default JobEntryForm;