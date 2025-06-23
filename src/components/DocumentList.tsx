import React from "react";

interface DocumentItem {
  id: string;
  name: string;
  type?: string;
  createdAt?: Date | string;
  previewText?: string;
  onPreview?: () => void;
}

interface DocumentListProps {
  documents: DocumentItem[];
}

const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  return (
    <div className="max-h-96 overflow-y-auto bg-gray-800 dark:bg-gray-200 rounded-lg shadow-md p-4 space-y-2 max-w-4xl w-full mx-auto">
      <h3 className="text-xl font-semibold text-white dark:text-gray-900 mb-2">Uploaded Documents</h3>
      {documents.length === 0 ? (
        <div className="text-gray-400">No documents uploaded yet.</div>
      ) : (
        documents.map((doc, idx) => (
          <div
            key={doc.id || doc.name + idx}
            className="flex items-center justify-between bg-gray-700 dark:bg-gray-200 rounded p-4 mb-2 hover:bg-gray-600 dark:hover:bg-gray-300 transition"
          >
            <div className="flex-1 min-w-0">
              <div className="break-all text-white dark:text-gray-900 font-medium flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded bg-gray-900 dark:bg-gray-300 text-xs font-bold text-blue-300 dark:text-blue-700 border border-blue-400 dark:border-blue-600 mr-2 whitespace-nowrap">
                  {doc.type || 'FILE'}
                </span>
                {doc.name}
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
            {doc.onPreview && (
              <button
                onClick={doc.onPreview}
                className="ml-4 px-3 py-1 bg-indigo-600 dark:bg-indigo-500 text-white dark:text-gray-100 rounded shadow hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none"
              >
                Preview
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default DocumentList;
