"use client";
import { useState } from "react";

type RawToggleProps = {
  label: string;
  data: any;
};

export default function RawToggle({ label, data }: RawToggleProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="my-4">
      <button
        className="text-sm text-blue-400 underline"
        onClick={() => setShow(!show)}
      >
        {show ? `Hide ${label} JSON` : `Show ${label} JSON`}
      </button>

      {show && (
        <pre className="mt-2 p-4 border border-gray-600 rounded bg-gray-700
            text-white text-sm overflow-auto whitespace-pre-wrap break-words max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
