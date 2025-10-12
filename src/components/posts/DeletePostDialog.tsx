"use client";

import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PostData } from "@/lib/type";
import { useDeletePostMutation } from "./actions/delete-post/mutations";
import LoadingButton from "../common/LoadingButton";

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
        <DialogFooter>
          <LoadingButton
            onClick={() =>
              mutation.mutate(post.id, {
                onSuccess: () => setIsDeletePostDialog(false),
              })
            }
            loading={mutation.isPending}
            className="w-24"
          >
            Delete
          </LoadingButton>
          <Button
            variant="custom"
            onClick={() => setIsDeletePostDialog(false)}
            disabled={mutation.isPending}
            className="w-24"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
