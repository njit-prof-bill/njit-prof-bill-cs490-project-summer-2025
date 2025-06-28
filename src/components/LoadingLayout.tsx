// components/LoadingLayout.tsx
import Skeleton from "./Skeleton";

export default function LoadingLayout() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
      <div className="relative flex justify-center items-center">
        <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500" />
        <img
          src="/team-logo-p.png"
          alt="Loading avatar"
          className="rounded-full h-28 w-28"
        />
      </div>
    </div>
  );
}
