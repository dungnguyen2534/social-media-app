"use client";

import api from "@/lib/ky";
import { PostsPage, UserData } from "@/lib/type";
import Post from "../posts/Post";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScrollContainer from "../common/InfiniteScrollContainer";
import { Annoyed } from "lucide-react";
import FeedSkeletons from "./FeedSkeletons";
import { useAuth } from "@/app/auth-context";

interface UserProfileFeed {
  user: UserData;
}

export default function UserProfileFeed({ user }: UserProfileFeed) {
  const userHasNoPosts = user._count.posts === 0;
  const session = useAuth();

  const {
    data,
    status,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed", "user-profile-feed", user.id],
    queryFn: ({ pageParam }) => {
      if (userHasNoPosts) {
        return Promise.resolve({ posts: [], nextCursor: null } as PostsPage);
      }

      return api
        .get(
          `users/id/${user.id}/posts`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  const noPostPlaceholder = (
    <div className="bg-card flex h-fit flex-col gap-8 p-5 shadow-sm lg:rounded-md">
      <p className="text-center font-medium">
        {user.id === session?.user.id ? "You" : "This user"} hasn&apos;t posted
        anything yet...{" "}
      </p>
    </div>
  );

  if (status === "pending") {
    if (userHasNoPosts) return noPostPlaceholder;
    return <FeedSkeletons count={4} />;
  }

  if (status === "success" && posts.length === 0 && !hasNextPage) {
    return noPostPlaceholder;
  }

  if (status === "error") {
    return (
      <div className="mt-8 flex h-full flex-col items-center gap-8">
        <p className="text-xl font-medium">
          An error occured while loading {user.username}&apos;s posts...
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

      {isFetchingNextPage && <FeedSkeletons count={1} />}
    </InfiniteScrollContainer>
  );
}
