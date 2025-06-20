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

  }, [pathname]);

  return isLoading ? <LoadingLayout /> : null;
}