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
  onDelete?: (jobId: string) => void;
  isDeletingFromPreview?: boolean;
  onGenerate?: () => void;
  isGenerating?: boolean;
  user?: any; // Replace with your actual User type
}

export default function AIJobDescriptionPreview({ 
  selectedJob, 
  onDelete, 
  isDeletingFromPreview = false,
  onGenerate,
  isGenerating = false,
  user
}: JobDescriptionPreviewProps) {
  
  const handleDelete = () => {
    if (!selectedJob || !onDelete) return;
    if (confirm(`Are you sure you want to delete "${selectedJob.jobTitle}" at ${selectedJob.companyName}?`)) {
      onDelete(selectedJob.id);
    }
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate();
    }
  };

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
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8 max-h-[90vh] overflow-y-auto">
        {/* Scrollable container with max height */}
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
            Click on a job from the list to view its details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
      {/* Scrollable container with max height */}
      
      {/* Header */}
      <div className="bg-zinc-800 px-6 py-4 border-b border-zinc-700 flex justify-between items-start sticky top-0 z-10">
        <div className="space-y-1 flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-white">
            {selectedJob.jobTitle}
          </h2>
          <p className="text-orange-600 font-medium">{selectedJob.companyName}</p>
        </div>
        <div className="flex items-start space-x-3">
          {/* Generate Button */}
          {onGenerate && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !user}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white text-sm font-medium rounded transition flex items-center space-x-2"
              title={!user ? "Please log in to generate AI insights" : "Generate AI insights for this job"}
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Generating Resume...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate Resume</span>
                </>
              )}
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeletingFromPreview}
              className="p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
              title="Delete job description"
            >
              {isDeletingFromPreview ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Content area with scrollable text */}
      <div className="p-4 flex-1" style={{ minHeight: 0 }}> {/* To allow flex item to shrink properly */}
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

      {/* Footer with extracted date */}
      <div className="bg-zinc-800 px-6 py-3 border-t border-zinc-700 sticky bottom-0 z-10">
        <div className="text-right">
          <p className="text-xs text-zinc-500">Extracted</p>
          <p className="text-sm text-zinc-400">{formatDate(selectedJob.extractedAt)}</p>
        </div>
      </div>
    </div>
  );
}