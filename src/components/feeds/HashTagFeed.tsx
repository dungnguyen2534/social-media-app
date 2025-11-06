"use client";

import api from "@/lib/ky";
import { PostsPage } from "@/lib/type";
import Post from "../posts/Post";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScrollContainer from "../common/InfiniteScrollContainer";
import { Annoyed } from "lucide-react";
import FeedSkeletons from "./FeedSkeletons";

interface HashTagFeedProps {
  hashtag: string;
}

export default function HashTagFeed({ hashtag }: HashTagFeedProps) {
  const {
    data,
    status,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed", "hashtag-feed", hashtag],
    queryFn: ({ pageParam }) => {
      return api
        .get(
          `posts/hashtag/${hashtag}`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <FeedSkeletons count={5} />;
  }

  if (status === "error") {
    return (
      <div className="text-muted-foreground mt-8 flex h-full flex-col items-center gap-8">
        <Annoyed className="size-24" />
        <p className="text-xl font-medium">
          An error occured while loading posts...
        </p>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post, i) => (
        <Post
          post={post}
          className="mb-1 lg:mb-2"
          key={post.id}
          imagePriority={i === 0}
        />
      ))}

      {isFetchingNextPage && <FeedSkeletons count={1} />}
    </InfiniteScrollContainer>
  );
}
