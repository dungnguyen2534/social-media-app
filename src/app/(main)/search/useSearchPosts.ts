import api from "@/lib/ky";
import { PostsPage } from "@/lib/type";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export function useSearchPosts(searchQuery: string) {
  const trimmedQuery = searchQuery.trim();
  const isSearching = !!trimmedQuery;

  const { data: postsDataPreview, status: previewStatus } = useQuery({
    queryKey: ["feed", "search-preview"],
    queryFn: async () => await api.get("posts/for-you").json<PostsPage>(),
  });

  const {
    data: searchData,
    fetchNextPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage,
    isFetching,
    isFetched,
  } = useInfiniteQuery({
    queryKey: ["feed", "search", trimmedQuery],
    queryFn: ({ pageParam }) =>
      api
        .get("search/posts", {
          searchParams: {
            q: trimmedQuery,
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isSearching,
    gcTime: 0,
  });

  const searchPosts = searchData?.pages.flatMap((page) => page.posts) || [];
  const posts = isSearching ? searchPosts : postsDataPreview?.posts || [];

  const isFetchingFirstPostsPage = isSearching
    ? searchPosts.length === 0 && isFetching
    : previewStatus === "pending";

  const isPostsFetched = isSearching ? isFetched : previewStatus === "success";

  const hasNextPostsPage = isSearching ? hasNextSearchPage : false;
  const isFetchingNextPostsPage = isSearching ? isFetchingNextPage : false;

  const isFetchingPostsPage = isSearching
    ? isFetching
    : isFetchingFirstPostsPage;

  return {
    posts,
    isFetchingFirstPostsPage,
    isPostsFetched,
    fetchNextPostPage: fetchNextPage,
    hasNextPostsPage,
    isFetchingNextPostsPage,
    isFetchingPostsPage,
  };
}
