import { Bell } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

export default function Notification() {
  // use shadcn dropdown
  return (
    <Button className="lg:hidden" size="icon" variant="ghost">
      <Bell className="mt-[0.15rem] h-[1.1rem] w-[1.1rem]" />
    </Button>
  );
}
