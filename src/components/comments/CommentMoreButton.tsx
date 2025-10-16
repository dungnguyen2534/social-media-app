import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import DeleteCommentDialog from "./DeleteCommentDialog";
import { CommentData } from "@/lib/type";

interface CommentMoreButton {
  className?: string;
  forReply?: boolean;
  comment: CommentData;
  setIsEditing: (isEditing: boolean) => void;
  setIsDeleting: (isDeleting: boolean) => void;
  disabled?: boolean;
}

export default function CommentMoreButton({
  className,
  forReply,
  comment,
  setIsEditing,
  setIsDeleting,
  disabled,
}: CommentMoreButton) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            title="More options"
            size="icon"
            variant="ghost"
            className={cn(
              "hover:text-primary text-muted-foreground rounded-full",
              className,
              isMenuOpen && "opacity-100",
            )}
            disabled={disabled}
          >
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="space-y-1">
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <SquarePen className="mt-[0.1rem] mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <hr />
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mt-[0.1rem] mr-2 size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteCommentDialog
        forReply={forReply}
        comment={comment}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        setIsDeleting={setIsDeleting}
      />
    </>
  );
}
