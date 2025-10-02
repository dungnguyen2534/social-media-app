"use client";

import dynamic from "next/dynamic";
import { ToasterProps } from "react-hot-toast";

// Prevent hydration error in certain cases
const DynamicToaster = dynamic(
  () => import("react-hot-toast").then((mod) => mod.Toaster),
  {
    ssr: false,
  },
);

export default function ClientToaster({ toastOptions }: ToasterProps) {
  return <DynamicToaster toastOptions={toastOptions} />;
}
