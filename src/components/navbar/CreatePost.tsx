import { PencilLine } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

export function CreatePost() {
  // use shadcn dialog
  return (
    <Button variant="secondary" className="hidden h-8 rounded-full md:flex">
      <PencilLine className="mt-[0.15rem] size-4" />
      Post
    </Button>
  );
}

export function MobileCreatePostButton() {
  return (
    <div className="hover:bg-accent flex aspect-square h-8 cursor-pointer items-center justify-center rounded-full transition-colors md:hidden">
      <PencilLine className="mt-[0.15rem] h-[1.1rem] w-[1.1rem]" />
    </div>
  );
}
