"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

interface MainGridProps {
  children: React.ReactNode;
}

export default function MainGrid({ children }: MainGridProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "app-container app-grid mt-1 !px-0 lg:mt-2 lg:px-3",
        pathname === "/messages" &&
          "lg:!grid-cols-[minmax(0,0.99145fr)_minmax(0,2.75fr))]",
      )}
    >
      {children}
    </div>
  );
}
