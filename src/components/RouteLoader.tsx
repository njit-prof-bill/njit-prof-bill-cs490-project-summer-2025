// components/RouteLoader.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingLayout from "@/components/LoadingLayout";

export default function RouteLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);

    // Simulate loading delay (replace this with your real logic if needed)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // 300ms fake delay

    return () => clearTimeout(timer);
  }, [pathname]);

  return isLoading ? <LoadingLayout /> : null;
}