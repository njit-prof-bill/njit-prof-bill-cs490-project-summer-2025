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
        className="text-sm text-blue-600 underline"
        onClick={() => setShow(!show)}
      >
        {show ? `Hide ${label} JSON` : `Show ${label} JSON`}
      </button>

      {show && (
        <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
