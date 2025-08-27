import { Bell } from "lucide-react";
import React from "react";

export default function Notification() {
  // use shadcn dropdown
  return (
    <div className="hover:bg-accent flex aspect-square h-9 cursor-pointer items-center justify-center rounded-full transition-colors">
      <Bell className="mt-[0.15rem] h-[1.1rem] w-[1.1rem]" />
    </div>
  );
}
