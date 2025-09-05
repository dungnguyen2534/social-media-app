import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./actions";
import { PostsPage } from "@/lib/type";
import { isActionError } from "@/lib/action-error";
import { useAuth } from "@/app/auth-context";

// Mutate the cache instead of refetching everything when creating a new post
export function useSubmitPostMutation() {
  const queryClient = useQueryClient();
  const session = useAuth();

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (result) => {
      if (isActionError(result)) {
        console.error(result.error);
        return;
      }

      const queryFilter = {
        queryKey: ["feed"],

        // Target "for-you" and the current user's "user-posts" feeds for cache updates.
        predicate: (query) => {
          const isForYouFeed = query.queryKey.includes("for-you-feed");
          const isUserOwnFeed =
            query.queryKey.includes("user-profile-feed") &&
            query.queryKey.includes(session?.user.id);

          return isForYouFeed || isUserOwnFeed;
        },
      } satisfies QueryFilters;

      // Cancels any ongoing fetches for the targeted feeds to prevent them from overwriting our manual cache update.
      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [result, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      // Invalidate the feeds that currently have no data in the cache, forcing them to refetch when accessed.
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate: (query) => queryFilter.predicate(query) && !query.state.data,
      });
    },
  });

  return mutation;
}
