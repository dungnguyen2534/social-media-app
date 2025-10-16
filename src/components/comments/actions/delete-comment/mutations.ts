import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteComment } from "./actions";
import { CommentsPage } from "@/lib/type";
import { isActionError } from "@/lib/action-error";
import { useCommentContext } from "../../comment-context";

export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async (result) => {
      if (isActionError(result)) {
        console.error(result.error);
        return;
      }

      const commentsQueryKey: QueryKey = ["comments", result.postId];

      await queryClient.cancelQueries({ queryKey: commentsQueryKey });

      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        commentsQueryKey,
        (oldData) => {
          if (!oldData) return oldData;

          const newPages = oldData.pages.map((page) => ({
            ...page,
            comments: page.comments.filter(
              (comment) => comment.id !== result.id,
            ),
          }));

          return {
            ...oldData,
            pages: newPages,
          };
        },
      );
    },
  });

  return mutation;
}

export function useDeleteReplyMutation() {
  const queryClient = useQueryClient();
  const { setNewLocalReplies } = useCommentContext();

  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async (result) => {
      if (isActionError(result)) {
        console.error(result.error);
        return;
      }

      const repliesQueryKey: QueryKey = ["replies", result.parentCommentId];
      await queryClient.cancelQueries({ queryKey: repliesQueryKey });

      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        repliesQueryKey,
        (oldData) => {
          if (!oldData) return oldData;

          const newPages = oldData.pages.map((page) => ({
            ...page,
            comments: page.comments.filter(
              (comment) => comment.id !== result.id,
            ),
          }));

          return {
            ...oldData,
            pages: newPages,
          };
        },
      );

      const commentsQueryKey: QueryKey = ["comments", result.postId];
      await queryClient.cancelQueries({ queryKey: commentsQueryKey });

      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        commentsQueryKey,
        (oldData) => {
          if (!oldData) return oldData;

          const newPages = oldData.pages.map((page) => {
            return {
              ...page,
              comments: page.comments.map((comment) => {
                if (
                  comment.id === result.parentCommentId &&
                  comment._count.replies > 0
                ) {
                  return {
                    ...comment,
                    _count: {
                      ...comment._count,
                      replies: comment._count.replies - 1,
                    },
                  };
                }
                return comment;
              }),
            };
          });

          return {
            ...oldData,
            pages: newPages,
          };
        },
      );

      setNewLocalReplies((replies) =>
        replies.filter((reply) => reply.id !== result.id),
      );
    },
  });

  return mutation;
}
