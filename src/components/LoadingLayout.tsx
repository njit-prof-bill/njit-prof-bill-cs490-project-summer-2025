// components/LoadingLayout.tsx
import Skeleton from "./Skeleton";

export default function LoadingLayout() {
  return (
    <div className="flex h-screen w-full p-6 gap-6">
      {/* Left */}
      <div className="flex flex-col w-1/3 gap-6">
        {/* Top: saved resumes */}
        <div className="flex-1 border border-gray-200 rounded-md p-4">
          <Skeleton className="h-full" />
        </div>
        {/* Bottom: saved job descriptions */}
        <div className="flex-1 border border-gray-200 rounded-md p-4">
          <Skeleton className="h-full" />
        </div>
      </div>

      {/* Middle: resume preview */}
      <div className="w-1/3 border border-gray-200 rounded-md p-4">
        <Skeleton className="h-full" />
      </div>

      <div className="flex flex-col w-1/3 gap-6">
        {/* Right: Structured Profile */}
        <div className="flex-1 border border-gray-200 rounded-md p-4">
          <Skeleton className="h-full" />
        </div>
      </div>

      
    </div>



  );
}
