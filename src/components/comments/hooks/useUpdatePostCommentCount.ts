import { PostsPage } from "@/lib/type";
import {
  InfiniteData,
  QueryFilters,
  useQueryClient,
} from "@tanstack/react-query";

export default function useUpdatePostCommentCount() {
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

  const decrementCommentCount = (postId: string) => {
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
              const newCommentCount = Math.max(0, p._count.comments - 1);

              return {
                ...p,
                _count: {
                  ...p._count,
                  comments: newCommentCount,
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

  return { incrementCommentCount, decrementCommentCount };
}
