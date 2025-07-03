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
    <div className="max-h-96 overflow-y-auto bg-gray-800 dark:bg-gray-200 rounded-lg shadow-md p-4 space-y-2 max-w-4xl w-full mx-auto">
      {!hideTitle && (
        <h3 className="text-xl font-semibold text-white dark:text-gray-900 mb-2">Uploaded Documents</h3>
      )}
      {documents.length === 0 ? (
        <div className="text-gray-400">No documents uploaded yet.</div>
      ) : (
        documents.map((doc, idx) => {
          const isSelected = doc.id === selectedId;
          return (
            <div
              key={doc.id || doc.name + idx}
              className={`flex items-center justify-between rounded p-4 mb-2 transition cursor-pointer ${isSelected ? 'bg-green-200 dark:bg-green-900 border-2 border-green-500' : 'bg-gray-700 dark:bg-gray-200 hover:bg-gray-600 dark:hover:bg-gray-300'}`}
              onClick={() => onSelect && onSelect(doc)}
            >
              <div className="flex-1 min-w-0">
                <div className="break-all text-white dark:text-gray-900 font-medium flex items-center gap-2">
                  <span className="inline-block px-2 py-0.5 rounded bg-gray-900 dark:bg-gray-300 text-xs font-bold text-blue-300 dark:text-blue-700 border border-blue-400 dark:border-blue-600 mr-2 whitespace-nowrap">
                    {doc.type || 'FILE'}
                  </span>
                  {doc.name}
                  {/* Inline spinner for selected doc while AI is loading */}
                  {(isSelected && aiLoading) ? <Spinner /> : null}
                </div>
                {doc.createdAt && (
                  <div className="mt-1 text-xs text-gray-400 dark:text-gray-600 font-mono">
                    {typeof doc.createdAt === 'string' ? new Date(doc.createdAt).toLocaleString() : doc.createdAt.toLocaleString()}
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
                  <div className="mt-2 text-xs text-gray-300 dark:text-gray-700 bg-gray-900 dark:bg-gray-100 bg-opacity-60 rounded p-2 max-h-16 overflow-hidden whitespace-pre-line">
                    {doc.previewText.length > 120
                      ? doc.previewText.slice(0, 120) + '...'
                      : doc.previewText}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {doc.onPreview && (
                  <button
                    onClick={e => { e.stopPropagation(); doc.onPreview && doc.onPreview(); }}
                    className="px-3 py-1 bg-indigo-600 dark:bg-indigo-500 text-white dark:text-gray-100 rounded shadow hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none mb-1"
                  >
                    Preview
                  </button>
                )}
                {doc.onDelete && (
                  <button
                    onClick={e => { e.stopPropagation(); doc.onDelete && doc.onDelete(); }}
                    className="px-3 py-1 bg-red-600 dark:bg-red-500 text-white dark:text-gray-100 rounded shadow hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none"
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
