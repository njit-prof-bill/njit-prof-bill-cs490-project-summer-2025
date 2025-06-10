// components/LoadingLayout.tsx
import Skeleton from "./Skeleton";

export default function LoadingLayout() {
  return (
    <div className="flex h-screen w-full p-6 gap-6">
      {/* Left half */}
      <div className="flex flex-col w-1/2 gap-6">
        {/* Top: saved resumes */}
        <div className="flex-1 border border-gray-200 rounded-md p-4">
          <Skeleton className="h-full" />
        </div>
        {/* Bottom: saved job descriptions */}
        <div className="flex-1 border border-gray-200 rounded-md p-4">
          <Skeleton className="h-full" />
        </div>
      </div>

      {/* Right half: resume preview */}
      <div className="w-1/2 border border-gray-200 rounded-md p-4">
        <Skeleton className="h-full" />
      </div>
    </div>
  );
}
