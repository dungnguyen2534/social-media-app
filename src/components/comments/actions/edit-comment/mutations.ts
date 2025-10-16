import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { editComment } from "./actions";
import { isActionError } from "@/lib/action-error";
import { CommentsPage } from "@/lib/type";
import { useCommentContext } from "../../comment-context";

export function useEditCommentMutation(postId: string, commentId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: editComment,
    onSuccess: async (result) => {
      if (isActionError(result)) {
        console.error(result.error);
        return;
      }

      const queryKey: QueryKey = ["comments", postId];
      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                comments: page.comments.map((comment) =>
                  comment.id === commentId ? result : comment,
                ),
              })),
            };
          }
          return oldData;
        },
      );

      queryClient.invalidateQueries({
        queryKey,
        predicate: (query) => !query.state.data,
      });
    },
  });

  return mutation;
}

export function useEditReplyMutation(parentCommentId: string, replyId: string) {
  const queryClient = useQueryClient();
  const { setNewLocalReplies } = useCommentContext();

  const mutation = useMutation({
    mutationFn: editComment,
    onSuccess: async (result) => {
      if (isActionError(result)) {
        console.error(result.error);
        return;
      }

      const queryKey: QueryKey = ["replies", parentCommentId];
      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                comments: page.comments.map((comment) =>
                  comment.id === replyId ? result : comment,
                ),
              })),
            };
          }
          return oldData;
        },
      );

      setNewLocalReplies((replies) =>
        replies.map((reply) => (reply.id === replyId ? result : reply)),
      );

      queryClient.invalidateQueries({
        queryKey,
        predicate: (query) => !query.state.data,
      });
    },
  });

  return mutation;
}
