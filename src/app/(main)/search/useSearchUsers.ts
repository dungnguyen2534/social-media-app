import api from "@/lib/ky";
import { UsersPage } from "@/lib/type";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useSearchUsers(searchQuery: string) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
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

  const users = data?.pages.flatMap((page) => page.users) || [];
  const isFetchingFirstUsersPage = users.length === 0 && isFetching;

  return {
    users,
    isFetchingFirstUsersPage,
    isUsersFetched: isFetched,
    fetchNextUsersPage: fetchNextPage,
    hasNextUsersPage: hasNextPage,
    isFetchingNextUsersPage: isFetchingNextPage,
    isFetchingUsersPage: isFetching,
  };
}
