import {
  InfiniteData,
  QueryFilters,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitComment } from "./actions";
import { CommentsPage, PostsPage } from "@/lib/type";
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

export function useUpdatePostCommentCount() {
  const queryClient = useQueryClient();

  const incrementCommentCount = (postId: string) => {
    const queryFilter = {
      queryKey: ["feed"],
      predicate: (query) => {
        return Array.isArray(query.queryKey) && query.queryKey[0] === "feed";
      },
    } satisfies QueryFilters;

    queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
      queryFilter,
      (oldData) => {
        if (!oldData) {
          return oldData;
        }

        const updatedPages = oldData.pages.map((page) => {
          if (!page.posts) {
            return page;
          }

          const updatedPosts = page.posts.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                _count: {
                  ...p._count,
                  comments: p._count.comments + 1,
                },
              };
            }
            return p;
          });

          return {
            ...page,
            posts: updatedPosts,
          };
        });

        return {
          ...oldData,
          pages: updatedPages,
        };
      },
    );
  };

  return { incrementCommentCount };
}
