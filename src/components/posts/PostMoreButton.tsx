"use client";

import { useState } from "react";
import DeletePostDialog from "./DeletePostDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { PostData } from "@/lib/type";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/auth-context";
import toast from "react-hot-toast";

interface PostMoreButtonProps {
  post: PostData;
  className?: string;
}

export default function PostMoreButton({
  post,
  className,
}: PostMoreButtonProps) {
  const session = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isUserPost = session?.user.id === post.user.id;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
    toast("Post link copied to clipboard");
  };

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            title="More options"
            size="icon"
            variant="ghost"
            className={cn(
              "rounded-full",
              className,
              isMenuOpen && "opacity-100",
            )}
          >
            <MoreHorizontal className="text-muted-foreground size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="space-y-1">
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="mt-[0.1rem] mr-2 size-4" />
            Copy link
          </DropdownMenuItem>
          {isUserPost && (
            <>
              <hr />
              <DropdownMenuItem
                onClick={() => {
                  setShowDeleteDialog(true);
                  setIsMenuOpen(false);
                }}
              >
                <Trash2 className="mt-[0.1rem] mr-2 size-4" /> Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeletePostDialog
        post={post}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
