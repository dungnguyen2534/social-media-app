import api from "@/lib/ky";
import { PostsPage } from "@/lib/type";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useSearchPosts(searchQuery: string) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isFetched,
  } = useInfiniteQuery({
    queryKey: ["feed", "search", searchQuery],
    queryFn: ({ pageParam }) =>
      api
        .get("search/posts", {
          searchParams: {
            q: searchQuery,
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!searchQuery.trim(),
    gcTime: 0,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];
  const isFetchingFirstPostsPage = posts.length === 0 && isFetching;

  return {
    posts,
    isFetchingFirstPostsPage,
    isPostsFetched: isFetched,
    fetchNextPostPage: fetchNextPage,
    hasNextPostsPage: hasNextPage,
    isFetchingNextPostsPage: isFetchingNextPage,
    isFetchingPostsPage: isFetching,
  };
}
