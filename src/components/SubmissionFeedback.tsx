"use client";

import { useEffect, useState } from "react";

type SubmissionFeedbackProps = {
  message: string;
  type: "success" | "error";
  duration?: number; // ms before auto-dismiss, default 3000ms
  onDismiss?: () => void; // optional callback
};

export default function SubmissionFeedback({
  message,
  type,
  duration = 8000,
  onDismiss,
}: SubmissionFeedbackProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!visible) return null;

  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";

  return (
    <div
      className={`${bgColor} ${textColor} px-4 py-3 rounded mb-4 border border-current`}
      role="alert"
    >
      <strong className="font-bold">
        {type === "success" ? "Success" : "Error"}:
      </strong>{" "}
      <span>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
        className="ml-4 font-semibold"
        aria-label="Dismiss message"
      >
        ×
      </button>
    </div>
  );
}
