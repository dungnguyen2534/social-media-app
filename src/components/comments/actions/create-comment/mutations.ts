import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitComment } from "./actions";
import { CommentsPage } from "@/lib/type";
import { isActionError } from "@/lib/action-error";

export function useSubmitCommentMutation(postId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitComment,
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
          const firstPage = oldData?.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  comments: [result, ...firstPage.comments],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
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

export function useSubmitReplyMutation(parentCommentId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitComment,
    onSuccess: async (result) => {
      if (isActionError(result)) {
        console.error(result.error);
        return;
      }

      const queryKey: QueryKey = ["replies", parentCommentId];
      await queryClient.cancelQueries({ queryKey });

      const commentsQueryKey: QueryKey = ["comments", result.postId];
      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        commentsQueryKey,
        (oldData) => {
          if (!oldData) return oldData;

          const newPages = oldData.pages.map((page) => {
            return {
              ...page,
              comments: page.comments.map((comment) => {
                if (comment.id === parentCommentId) {
                  if (comment._count.replies >= 1) {
                    return {
                      ...comment,
                      _count: {
                        ...comment._count,
                        replies: comment._count.replies + 1,
                      },
                    };
                  }
                  return comment;
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

      queryClient.invalidateQueries({
        queryKey,
        predicate: (query) => !query.state.data,
      });
    },
  });

  return mutation;
}
