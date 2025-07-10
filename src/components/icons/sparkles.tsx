import React from 'react';

export function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 8.09L5 9l1 3 1-3 3-.91-3-1.22-1-3-1 3-3 1.22z" />
      <path d="M8 15.91L5 17l-1 3-1-3-3-1.09 3-1.22 1-3 1 3 3 1.22z" />
      <path d="M12 3l.94 2.82L16 6l-2.88 1.18L12 10l-.94-2.82L8 6l2.88-1.18L12 3z" />
      <path d="M16 15.91l-3 1.22-1 3-1-3-3-1.09 3-1.22 1-3 1 3 3 1.22z" />
      <path d="M22 8.09l-3 1.22-1 3-1-3-3-.91 3-1.22 1-3 1 3 3 .91z" />
    </svg>
  );
}
