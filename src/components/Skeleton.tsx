// components/Skeleton.tsx
export default function Skeleton({ className = "" }: { className?: string }) {
    return (
      <div
        className={`animate-pulse bg-gray-300 rounded-md ${className}`}
        aria-busy="true"
        aria-label="Loading content"
      />
    );
  }
  