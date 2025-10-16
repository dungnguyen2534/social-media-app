"use client";

import api from "@/lib/ky";
import { CommentsPage, PostData } from "@/lib/type";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScrollContainer from "../common/InfiniteScrollContainer";
import Comment from "./Comment";
import CommentSkeletons from "./CommentSkeletons";
import { MessageCircleDashed } from "lucide-react";

interface CommentsProps {
  post: PostData;
}

export default function Comments({ post }: CommentsProps) {
  const {
    data,
    hasNextPage,
    isFetching,
    fetchNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["comments", post.id],
    queryFn: ({ pageParam }) => {
      return api
        .get(
          `posts/${post.id}/comments`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<CommentsPage>();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const renderedCommentIds = new Set<string>();

  const comments =
    data?.pages.flatMap((page) => {
      return page.comments.filter((comment) => {
        if (!renderedCommentIds.has(comment.id)) {
          renderedCommentIds.add(comment.id);
          return true;
        }
        return false;
      });
    }) || [];

  if (post._count.comments === 0)
    return (
      <div className="bg-card text-muted-foreground mt-16 flex h-fit flex-col gap-8 p-5">
        <p className="flex flex-col items-center gap-5 text-center text-base font-medium">
          <MessageCircleDashed className="size-24" />
          No comments yet, be the first!
        </p>
      </div>
    );

  if (status === "pending") {
    return <CommentSkeletons count={1} />;
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {comments.map((c) => (
        <Comment post={post} comment={c} key={c.id} className="mt-3" />
      ))}

      {isFetchingNextPage && <CommentSkeletons count={2} />}
    </InfiniteScrollContainer>
  );
}
