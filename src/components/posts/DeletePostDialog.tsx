"use client";

import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PostData } from "@/lib/type";
import { useDeletePostMutation } from "./actions/delete-post/mutations";
import LoadingButton from "../common/LoadingButton";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

interface DeletePostDialogProps {
  post: PostData;
  isDeletePostDialog: boolean;
  setIsDeletePostDialog: (open: boolean) => void;
}

export default function DeletePostDialog({
  post,
  isDeletePostDialog,
  setIsDeletePostDialog,
}: DeletePostDialogProps) {
  const mutation = useDeletePostMutation();
  const pathname = usePathname();
  const router = useRouter();

  const [isTransitioning, startTransition] = useTransition();

  return (
    <Dialog open={isDeletePostDialog} onOpenChange={setIsDeletePostDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete post</DialogTitle>
          <hr />
          <DialogDescription>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          <LoadingButton
            onClick={() => {
              mutation.mutate(post.id, {
                onSuccess: () => {
                  if (pathname === `/posts/${post.id}`) {
                    startTransition(() => {
                      router.push("/");
                      setIsDeletePostDialog(false);
                    });
                  } else {
                    setIsDeletePostDialog(false);
                  }
                },
              });
            }}
            loading={mutation.isPending || isTransitioning}
            variant="destructive"
          >
            Delete
          </LoadingButton>
          <Button
            variant="custom"
            onClick={() => setIsDeletePostDialog(false)}
            disabled={mutation.isPending || isTransitioning}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
