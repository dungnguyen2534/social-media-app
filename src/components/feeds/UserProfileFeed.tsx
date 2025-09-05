"use client";

import api from "@/lib/ky";
import { PostsPage } from "@/lib/type";
import Post from "../posts/Post";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScrollContainer from "../common/InfiniteScrollContainer";

interface UserProfileFeed {
  userId: string;
}

export default function UserProfileFeed({ userId }: UserProfileFeed) {
  const {
    data,
    status,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed", "user-profile-feed", userId],
    queryFn: ({ pageParam }) => {
      return api
        .get(
          `users/${userId}/posts`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  // TODO: skeleton
  if (status === "pending") return <div>Loading...</div>;

  // TODO: use something better
  if (status === "error") {
    return (
      <p className="text-destructive text-center">
        An error occured while loading posts
      </p>
    );
  }

  if (status === "success" && posts.length === 0 && !hasNextPage) {
    return (
      <p className="text-destructive text-center">
        This suer hasn&apos;t posted anything yet.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post post={post} className="mb-2" key={post.id} />
      ))}

      {/* TODO: skeleton*/}
      {isFetchingNextPage && <div>Loading...</div>}
    </InfiniteScrollContainer>
  );
}
