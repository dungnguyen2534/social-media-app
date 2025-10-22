"use client";

import { usePathname } from "next/navigation";

interface DiscoveryPanelProps {
  children: React.ReactNode;
}

export function DiscoveryPanel({ children }: DiscoveryPanelProps) {
  const pathname = usePathname();

  const pathsToHide = ["/messages"];

  if (pathsToHide.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
