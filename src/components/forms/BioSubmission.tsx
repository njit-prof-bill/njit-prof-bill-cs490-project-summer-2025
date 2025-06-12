'use client';

import { useState, useEffect } from 'react';

export default function BioSubmission() {
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error' | 'empty' | 'tooShort' | 'tooLong' | 'invalid'>('idle');

  // Constants for length validation
  const MIN_LENGTH = 20;
  const MAX_LENGTH = 1000;

  // Basic HTML tag detection (naive but useful client-side)
  const containsHTMLTags = (input: string) => /<[^>]*>/g.test(input);

  const handleSubmit = async () => {
    const trimmed = bio.trim();

    if (!trimmed) {
      setStatus('empty');
      return;
    }

    if (trimmed.length < MIN_LENGTH) {
      setStatus('tooShort');
      return;
    }

    if (trimmed.length > MAX_LENGTH) {
      setStatus('tooLong');
      return;
    }

    if (containsHTMLTags(trimmed)) {
      setStatus('invalid');
      return;
    }

    setStatus('submitting');
    try {
      await new Promise(res => setTimeout(res, 1000)); // simulate async post
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  // Reset success or error if user changes text after submitting
  useEffect(() => {
    if (
        status === 'success' || status === 'error' || status === 'tooShort' || status === 'tooLong' || (status === 'invalid' && bio.trim().length > 0)
    ) {
        setStatus('idle');
    }
    }, [bio]);

  return (
    <div className="space-y-4">
      <textarea
        rows={6}
        placeholder="Write your biography here (min 20 characters)..."
        className="w-full p-3 border border-gray-300 rounded resize-none"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
    
    <p className={`text-sm mt-1 ${bio.length < 20 ? 'text-red-500' : 'text-gray-400'}`}>
        {bio.length} / 500 characters
    </p>

      <button
        onClick={handleSubmit}
        disabled={status === 'submitting'}
        className={`px-4 py-2 text-white rounded ${status === 'submitting' ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {status === 'submitting' ? 'Submitting...' : 'Submit Bio'}
      </button>

      {/* Feedback messages */}
      {status === 'success' && <p className="text-green-600">Biography submitted successfully!</p>}
      {status === 'error' && <p className="text-red-600">Something went wrong. Please try again.</p>}
      {status === 'empty' && <p className="text-red-600">Biography cannot be empty.</p>}
      {status === 'tooShort' && <p className="text-red-600">Biography must be at least {MIN_LENGTH} characters.</p>}
      {status === 'tooLong' && <p className="text-red-600">Biography must be less than {MAX_LENGTH} characters.</p>}
      {status === 'invalid' && <p className="text-red-600">HTML tags are not allowed in your bio.</p>}
    </div>
  );
}