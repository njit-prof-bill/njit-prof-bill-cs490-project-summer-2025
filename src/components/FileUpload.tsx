'use client';

import { useState, useRef } from 'react';

const allowedTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'application/vnd.oasis.opendocument.text'
];

const allowedExtensions = ['.pdf', '.docx', '.txt', '.md', '.odt'];

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement | null>(null); // to reset input

  const isValidFile = (file: File) => {
    const mimeOk = allowedTypes.includes(file.type);
    const extOk = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    return mimeOk || extOk;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
        setStatus('idle'); // reset status if user cancels
        return;
    }

    if (isValidFile(selected)) {
      setFile(selected);
      setStatus('idle'); // clears previous success/error
    } else {
      alert('Unsupported file type.');
      setFile(null); // clear state
      setStatus('idle'); // reset status if file is unsupported
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // clear input box
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    try {
      await new Promise((res) => setTimeout(res, 1500)); 
      setStatus('success');
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus('error');
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".pdf,.docx,.txt,.md,.odt"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={status === 'uploading' || !file}
      >
        {status === 'uploading' ? 'Uploading...' : 'Upload File'}
      </button>
      {status === 'success' && <p className="text-green-600">Upload successful!</p>}
      {status === 'error' && <p className="text-red-600">Upload failed. Try again.</p>}
    </div>
  );
}
