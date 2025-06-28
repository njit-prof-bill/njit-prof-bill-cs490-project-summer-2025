"use client";

interface JobDescription {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  extractedAt: string;
  createdAt: any;
}

interface JobDescriptionPreviewProps {
  selectedJob: JobDescription | null;
}

export default function JobDescriptionPreview({ selectedJob }: JobDescriptionPreviewProps) {
  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date not available";
    }
  };

  if (!selectedJob) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8">
        <div className="text-center text-zinc-400">
          <div className="mb-4">
            <svg 
              className="w-16 h-16 mx-auto text-zinc-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-500 mb-2">
            No Job Selected
          </h3>
          <p className="text-sm text-zinc-600">
            Click on a job from the list to view its full details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">
              {selectedJob.jobTitle}
            </h2>
            <p className="text-orange-600 font-medium">
              {selectedJob.companyName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">
              Extracted
            </p>
            <p className="text-sm text-zinc-400">
              {formatDate(selectedJob.extractedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Job Description Content */}
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3">
              Job Description
            </h3>
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {selectedJob.jobDescription}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-zinc-800 px-6 py-3 border-t border-zinc-700">
        <div className="flex justify-between items-center text-xs text-zinc-500">
          <span>Document ID: {selectedJob.id}</span>
          <span>
            {selectedJob.jobDescription.length} characters
          </span>
        </div>
      </div>
    </div>
  );
}