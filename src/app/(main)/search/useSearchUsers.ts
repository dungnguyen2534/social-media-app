import api from "@/lib/ky";
import { UsersPage } from "@/lib/type";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export function useSearchUsers(searchQuery: string) {
  const trimmedQuery = searchQuery.trim();
  const isSearching = !!trimmedQuery;

  const { data: usersDataPreview, status: previewStatus } = useQuery({
    queryKey: ["users", "search-preview"],
    queryFn: async () => await api.get(`users`).json<UsersPage>(),
  });

  const {
    data: searchData,
    fetchNextPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage,
    isFetching,
    isFetched,
  } = useInfiniteQuery({
    queryKey: ["users", "search", searchQuery],
    queryFn: ({ pageParam }) =>
      api
        .get("search/users", {
          searchParams: {
            q: searchQuery,

            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .json<UsersPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!searchQuery.trim(),
    gcTime: 0,
  });

  const searchUsers = searchData?.pages.flatMap((page) => page.users) || [];
  const users = isSearching ? searchUsers : usersDataPreview?.users || [];

  const isFetchingFirstUsersPage = isSearching
    ? searchUsers.length === 0 && isFetching
    : previewStatus === "pending";

  const isUsersFetched = isSearching ? isFetched : previewStatus === "success";

  const hasNextUsersPage = isSearching ? hasNextSearchPage : false;
  const isFetchingNextUsersPage = isSearching ? isFetchingNextPage : false;

  const isFetchingUsersPage = isSearching
    ? isFetching
    : isFetchingFirstUsersPage;

  return {
    users,
    isFetchingFirstUsersPage,
    isUsersFetched,
    fetchNextUsersPage: fetchNextPage,
    hasNextUsersPage,
    isFetchingNextUsersPage,
    isFetchingUsersPage,
  };
}
