"use client";

import api from "@/lib/ky";
import { PostsPage } from "@/lib/type";
import Post from "../posts/Post";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScrollContainer from "../common/InfiniteScrollContainer";
import { Annoyed } from "lucide-react";
import FeedSkeletons from "./FeedSkeletons";

export default function FollowingFeed() {
  const {
    data,
    status,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed", "following-feed"],
    queryFn: ({ pageParam }) => {
      return api
        .get(
          "posts/following",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <FeedSkeletons count={4} />;
  }

  if (status === "error") {
    return (
      <div className="mt-8 flex h-full flex-col items-center gap-8">
        <p className="text-xl font-medium">
          An error occured while loading posts...
        </p>
        <Annoyed className="size-48" />
      </div>
    );
  }

  if (status === "success" && posts.length === 0 && !hasNextPage) {
    return (
      <div className="bg-card flex h-fit flex-col gap-8 p-5 shadow-sm lg:rounded-md">
        <p className="text-center font-medium">
          Your following feed is empty...
        </p>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post post={post} className="mb-1 lg:mb-2" key={post.id} />
      ))}

      {/* TODO: skeleton*/}
      {isFetchingNextPage && <FeedSkeletons count={2} />}
    </InfiniteScrollContainer>
  );
}
