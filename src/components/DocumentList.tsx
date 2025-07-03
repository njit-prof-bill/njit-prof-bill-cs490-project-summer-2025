import React from "react";

interface DocumentItem {
  id: string;
  name: string;
  type?: string;
  createdAt?: Date | string;
  previewText?: string;
  onPreview?: () => void;
  onDelete?: () => void;
  isUploading?: boolean; // NEW: uploading spinner flag
  isParsing?: boolean;   // NEW: parsing spinner flag (optional, for future)
}

interface DocumentListProps {
  documents: DocumentItem[];
  selectedId?: string;
  onSelect?: (doc: DocumentItem) => void;
  aiLoading?: boolean;
  hideTitle?: boolean;
}

const Spinner = () => (
  <span className="ml-2 inline-block align-middle" aria-label="Parsing...">
    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  </span>
);

const DocumentList: React.FC<DocumentListProps> = ({ documents, selectedId, onSelect, aiLoading, hideTitle }) => {
  return (
    <div className="max-h-96 overflow-y-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-3 max-w-4xl w-full mx-auto border border-indigo-100 dark:border-gray-700">
      {!hideTitle && (
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Your Uploaded Resumes</h3>
      )}
      {documents.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No documents uploaded yet.</div>
      ) : (
        documents.map((doc, idx) => {
          const isSelected = doc.id === selectedId;
          return (
            <div
              key={doc.id || doc.name + idx}
              className={`flex flex-col md:flex-row md:items-center justify-between rounded-xl p-4 mb-2 transition cursor-pointer border-2 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900 border-indigo-500 shadow-lg' : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'}`}
              onClick={() => onSelect && onSelect(doc)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-block px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-700 text-xs font-bold text-indigo-700 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-600 mr-2 whitespace-nowrap">
                    {doc.type || 'FILE'}
                  </span>
                  <span className="font-semibold text-lg text-gray-900 dark:text-white break-all">{doc.name}</span>
                  {(isSelected && aiLoading) ? <Spinner /> : null}
                </div>
                {doc.createdAt && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                    Uploaded: {typeof doc.createdAt === 'string' ? new Date(doc.createdAt).toLocaleString() : doc.createdAt.toLocaleString()}
                  </div>
                )}
                {doc.previewText && doc.previewText.startsWith('data:image') ? (
                  <img
                    src={doc.previewText}
                    alt="PDF thumbnail"
                    className="mt-2 rounded shadow max-h-16 max-w-[80px] bg-white"
                    style={{ objectFit: 'contain' }}
                  />
                ) : doc.previewText ? (
                  <div className="mt-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 bg-opacity-60 rounded p-2 max-h-16 overflow-hidden whitespace-pre-line border border-gray-200 dark:border-gray-700">
                    {doc.previewText.length > 120
                      ? doc.previewText.slice(0, 120) + '...'
                      : doc.previewText}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-row md:flex-col gap-2 mt-4 md:mt-0 md:ml-4">
                {doc.onPreview && (
                  <button
                    onClick={e => { e.stopPropagation(); doc.onPreview && doc.onPreview(); }}
                    className="px-4 py-1.5 bg-indigo-600 dark:bg-indigo-500 text-white dark:text-gray-100 rounded-lg shadow hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none font-semibold transition"
                  >
                    Preview
                  </button>
                )}
                {doc.onDelete && (
                  <button
                    onClick={e => { e.stopPropagation(); doc.onDelete && doc.onDelete(); }}
                    className="px-4 py-1.5 bg-red-600 dark:bg-red-500 text-white dark:text-gray-100 rounded-lg shadow hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none font-semibold transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default DocumentList;
