"use client";

import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { useRef } from "react";

interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

export default function AddAttachmentsButton({
  onFilesSelected,
  disabled,
}: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagePlus className="size-6" />
      </Button>
      <input
        type="file"
        accept="image/*, video/*"
        multiple
        ref={fileInputRef}
        className="sr-only hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}
