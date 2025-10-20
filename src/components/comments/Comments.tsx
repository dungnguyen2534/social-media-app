"use client";

import api from "@/lib/ky";
import { CommentsPage, PostData } from "@/lib/type";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScrollContainer from "../common/InfiniteScrollContainer";
import Comment from "./Comment";
import CommentSkeletons from "./CommentSkeletons";
import { MessageCircleDashed } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CommentsProps {
  post: PostData;
  className?: string;
  targetCommentId?: string;
  targetReplyId?: string;
}

export default function Comments({
  post,
  targetCommentId,
  targetReplyId,
  className,
}: CommentsProps) {
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
          `posts/${post.id}/comments?targetCommentId=${targetCommentId}`,
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

  const targetCommentRef = useRef<HTMLDivElement>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (targetCommentId && status === "success") {
      if (targetCommentRef.current) {
        const timer = setTimeout(() => {
          targetCommentRef.current?.scrollIntoView({
            block: "center",
          });
        }, 0);

        setHighlightedId(targetCommentId);

        const highlightTimer = setTimeout(() => {
          setHighlightedId(null);
        }, 5000);

        return () => {
          clearTimeout(timer);
          clearTimeout(highlightTimer);
        };
      }
    }
  }, [targetCommentId, status]);

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
        <Comment
          post={post}
          comment={c}
          key={c.id}
          className={className}
          isHighlighted={c.id === highlightedId && !targetReplyId}
          ref={c.id === targetCommentId ? targetCommentRef : undefined}
          targetReplyId={c.id === targetCommentId ? targetReplyId : undefined}
        />
      ))}

      {isFetchingNextPage && <CommentSkeletons count={2} />}
    </InfiniteScrollContainer>
  );
}
