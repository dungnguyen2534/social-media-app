"use client";

import { PencilLine } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import PostEditor from "../posts/editor/PostEditor";
import { DialogTitle } from "@radix-ui/react-dialog";

export function CreatePost() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="hidden h-9 rounded-full !px-4 md:flex"
        >
          <PencilLine className="mt-[0.15rem] size-4" />
          Post
        </Button>
      </DialogTrigger>
      <DialogContent className="p-5">
        <DialogTitle className="-mb-1 text-lg font-semibold">
          Create a post
        </DialogTitle>
        <hr />
        <PostEditor onPostCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function MobileCreatePostButton() {
  return (
    <div className="hover:bg-accent flex aspect-square h-9 cursor-pointer items-center justify-center rounded-full transition-colors md:hidden">
      <PencilLine className="mt-[0.15rem] h-[1.1rem] w-[1.1rem]" />
    </div>
  );
}
