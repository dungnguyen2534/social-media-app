"use client";

import api from "@/lib/ky";
import { PostsPage } from "@/lib/type";
import Post from "../../../components/posts/Post";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScrollContainer from "../../../components/common/InfiniteScrollContainer";
import { Annoyed } from "lucide-react";
import FeedSkeletons from "../../../components/feeds/FeedSkeletons";

export default function Bookmarks() {
  const {
    data,
    status,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed", "bookmarks"],
    queryFn: ({ pageParam }) => {
      return api
        .get(
          "posts/bookmarked",
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

  if (status === "success" && posts.length === 0 && !hasNextPage) {
    return (
      <div className="bg-card flex h-fit flex-col gap-8 p-5 shadow-sm lg:rounded-md">
        <p className="text-center font-medium">
          You don&apos;t have any bookmark...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-8 flex h-full flex-col items-center gap-8">
        <p className="text-xl font-medium">
          An error occured while loading bookmarks...
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
        <Post post={post} className="mb-1 lg:mb-2" key={post.id} />
      ))}

      {isFetchingNextPage && <FeedSkeletons count={2} />}
    </InfiniteScrollContainer>
  );
}
