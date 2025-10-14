"use client";

import { CommentData, CommentsPage, PostData } from "@/lib/type";
import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/ky";
import Reply from "./Reply";
import { useCommentContext } from "../comment-context";
import CommentSkeletons from "../CommentSkeletons";

interface RepliesProps {
  post: PostData;
  parentComment: CommentData;
}

export default function Replies({ post, parentComment }: RepliesProps) {
  const { newLocalReplies, setNewLocalReplies } = useCommentContext();
  const [showReplies, setShowReplies] = useState(false);

  const { data, status, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["replies", parentComment.id],
      queryFn: ({ pageParam }) => {
        return api
          .get(
            `posts/${post.id}/comments/${parentComment.id}/replies`,
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<CommentsPage>();
      },
      initialPageParam: null as string | null,
      getNextPageParam: (firstPage) => firstPage.nextCursor,
      enabled: showReplies,
    });

  const fetchedReplies = useMemo(
    () => data?.pages.flatMap((page) => page.comments) || [],
    [data?.pages],
  );

  useEffect(() => {
    if (
      fetchedReplies.length > 0 &&
      newLocalReplies &&
      newLocalReplies.length > 0
    ) {
      const fetchedReplyIds = new Set(fetchedReplies.map((r) => r.id));

      const filterednewLocalReplies = newLocalReplies.filter(
        (newReply) => !fetchedReplyIds.has(newReply.id),
      );

      if (filterednewLocalReplies.length !== newLocalReplies.length) {
        setNewLocalReplies(filterednewLocalReplies);
      }
    }
  }, [fetchedReplies, setNewLocalReplies, newLocalReplies]);

  return (
    <div className="my-1">
      {!showReplies ? (
        parentComment._count.replies >= 1 && (
          <button
            className="text-muted-foreground hover:text-primary flex cursor-pointer items-center gap-2 text-xs"
            onClick={() => setShowReplies(true)}
          >
            <span className="bg-muted-foreground block h-[1px] w-5"></span>
            View replies ({parentComment._count.replies})
          </button>
        )
      ) : (
        <div>
          <div>
            {status === "pending" ? (
              <CommentSkeletons
                count={
                  parentComment._count.replies >= 6
                    ? 6
                    : parentComment._count.replies
                }
              />
            ) : (
              fetchedReplies.map((r) => (
                <Reply
                  reply={r}
                  post={post}
                  key={r.id}
                  className="mt-3"
                  parentCommentId={parentComment.id}
                />
              ))
            )}

            {isFetchingNextPage && <CommentSkeletons count={1} />}
          </div>
          {hasNextPage && (
            <button
              className="text-muted-foreground hover:text-primary my-1 flex cursor-pointer items-center gap-2 text-xs"
              onClick={() => fetchNextPage()}
            >
              <span className="bg-muted-foreground block h-[1px] w-5"></span>
              Load more
            </button>
          )}
        </div>
      )}

      {newLocalReplies &&
        newLocalReplies.map((r) => (
          <Reply
            reply={r}
            post={post}
            key={r.id}
            className="mt-3"
            parentCommentId={parentComment.id}
          />
        ))}
    </div>
  );
}
