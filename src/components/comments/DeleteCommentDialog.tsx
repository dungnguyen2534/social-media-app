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
import { CommentData } from "@/lib/type";
import LoadingButton from "../common/LoadingButton";
import {
  useDeleteCommentMutation,
  useDeleteReplyMutation,
} from "./actions/delete-comment/mutations";
import useUpdatePostCommentCount from "./hooks/useUpdatePostCommentCount";

interface DeleteCommentDialogProps {
  forReply?: boolean;
  comment: CommentData;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsDeleting: (isDeleting: boolean) => void;
}

export default function DeleteCommentDialog({
  forReply,
  comment,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  setIsDeleting,
}: DeleteCommentDialogProps) {
  const deleteCommentMutation = useDeleteCommentMutation();
  const deleteReplyMutation = useDeleteReplyMutation();

  const mutation = forReply ? deleteReplyMutation : deleteCommentMutation;

  const { decrementCommentCount } = useUpdatePostCommentCount();

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {forReply ? "reply" : "comment"}</DialogTitle>
          <hr />
          <DialogDescription>
            Are you sure you want to delete this{" "}
            {forReply ? "reply" : "comment"}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton
            onClick={() => {
              setIsDeleting(true);
              mutation.mutate(comment.id, {
                onSuccess: () => {
                  setIsDeleteDialogOpen(false);
                  decrementCommentCount(comment.postId);
                },
                onSettled: () => setIsDeleting(false),
              });
            }}
            loading={mutation.isPending}
            className="w-24"
          >
            Delete
          </LoadingButton>
          <Button
            variant="custom"
            onClick={() => setIsDeleteDialogOpen(false)}
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
