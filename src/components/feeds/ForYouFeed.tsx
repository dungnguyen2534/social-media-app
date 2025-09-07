"use client";

import api from "@/lib/ky";
import { PostsPage } from "@/lib/type";
import Post from "../posts/Post";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScrollContainer from "../common/InfiniteScrollContainer";
import { Annoyed } from "lucide-react";
import FeedSkeletons from "./FeedSkeletons";

export default function ForYouFeed() {
  const {
    data,
    status,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed", "for-you-feed"],
    queryFn: ({ pageParam }) => {
      return api
        .get(
          "posts/for-you",
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

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post post={post} className="mb-2" key={post.id} />
      ))}

      {isFetchingNextPage && <FeedSkeletons count={2} />}
    </InfiniteScrollContainer>
  );
}
