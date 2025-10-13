"use client";

import api from "@/lib/ky";
import { CommentsPage, PostData } from "@/lib/type";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScrollContainer from "../common/InfiniteScrollContainer";
import Comment from "./Comment";
import CommentSkeletons from "./CommentSkeletons";

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

  if (status === "pending") {
    return <CommentSkeletons count={2} />;
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
