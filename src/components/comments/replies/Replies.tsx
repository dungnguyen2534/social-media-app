"use client";

import { CommentData, CommentsPage, PostData } from "@/lib/type";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/ky";
import Reply from "./Reply";
import { useCommentContext } from "../comment-context";
import CommentSkeletons from "../CommentSkeletons";
import ReplyCreator from "./ReplyCreator";

interface RepliesProps {
  post: PostData;
  parentComment: CommentData;
  parentEditorOpen: boolean;
  setParentEditorOpen: (open: boolean) => void;
  targetReplyId?: string;
}

function StandardRepliesView({
  post,
  parentComment,
  showReplies,
  onReplyClick,
}: {
  post: PostData;
  parentComment: CommentData;
  showReplies: boolean;
  onReplyClick: (reply: CommentData) => void;
}) {
  const { data, status, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["replies", parentComment.id],
      queryFn: ({ pageParam }) =>
        api
          .get(
            `posts/${post.id}/comments/${parentComment.id}/replies`,
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<CommentsPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: showReplies,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });

  const fetchedReplies = useMemo(
    () => data?.pages.flatMap((page) => page.comments) || [],
    [data?.pages],
  );

  return (
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
              onReplyClick={onReplyClick}
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
  );
}

function InitialReplyView({
  post,
  parentComment,
  targetReplyId,
  onReplyClick,
}: {
  post: PostData;
  parentComment: CommentData;
  targetReplyId: string;
  onReplyClick: (reply: CommentData) => void;
}) {
  const {
    data,
    status,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useInfiniteQuery({
    queryKey: ["replies", parentComment.id, targetReplyId],
    queryFn: async ({ pageParam }) => {
      const { cursor, direction } = pageParam;
      let url = `posts/${post.id}/comments/${parentComment.id}/replies`;
      let options = {};

      if (direction === "initial") {
        url += `/${cursor}`;
      } else {
        options = { searchParams: { cursor, direction } };
      }

      return api.get(url, options).json<CommentsPage>();
    },
    initialPageParam: { cursor: targetReplyId, direction: "initial" },
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor
        ? { cursor: lastPage.nextCursor, direction: "next" }
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.prevCursor
        ? { cursor: firstPage.prevCursor, direction: "prev" }
        : undefined,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const allReplies = useMemo(
    () => data?.pages.flatMap((page) => page.comments) || [],
    [data?.pages],
  );

  if (status === "pending") {
    return <CommentSkeletons count={1} />;
  }

  return (
    <div>
      {isFetchingPreviousPage && <CommentSkeletons count={1} />}
      {hasPreviousPage && (
        <button
          className="text-muted-foreground hover:text-primary my-1 flex cursor-pointer items-center gap-2 text-xs"
          onClick={() => fetchPreviousPage()}
          disabled={isFetchingPreviousPage}
        >
          <span className="bg-muted-foreground block h-[1px] w-5"></span>
          {isFetchingPreviousPage ? "Loading..." : "Load previous"}
        </button>
      )}

      {allReplies.map((r) => (
        <Reply
          reply={r}
          post={post}
          key={r.id}
          className="mt-3"
          parentCommentId={parentComment.id}
          onReplyClick={onReplyClick}
          isTarget={r.id === targetReplyId}
        />
      ))}

      {isFetchingNextPage && <CommentSkeletons count={1} />}
      {hasNextPage && (
        <button
          className="text-muted-foreground hover:text-primary my-1 flex cursor-pointer items-center gap-2 text-xs"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          <span className="bg-muted-foreground block h-[1px] w-5"></span>
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}

export default function Replies({
  post,
  parentComment,
  parentEditorOpen,
  setParentEditorOpen,
  targetReplyId,
}: RepliesProps) {
  const { newLocalReplies } = useCommentContext();
  const [showReplies, setShowReplies] = useState(!!targetReplyId);

  const replyRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (newLocalReplies.length > 0) {
      const lastReplyId = newLocalReplies[newLocalReplies.length - 1].id;
      const lastReplyElement = replyRefs.current.get(lastReplyId);

      if (lastReplyElement) {
        lastReplyElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [newLocalReplies]);

  const setRef = (element: HTMLDivElement | null, id: string) => {
    if (element) {
      replyRefs.current.set(id, element);
    } else {
      replyRefs.current.delete(id);
    }
  };

  const [editorTarget, setEditorTarget] = useState<{
    id: string;
    reply: CommentData;
    parentCommentId: string;
  } | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const [editorKey, setEditorKey] = useState(0);

  const handleReplyClick = (reply: CommentData) => {
    if (editorTarget && reply.id === editorTarget.reply.id) {
      setEditorTarget(null);
      return;
    }

    if (parentEditorOpen) setParentEditorOpen(false);
    setEditorTarget({ id: reply.id, reply, parentCommentId: parentComment.id });
    setEditorKey((prev) => prev + 1);
    setTimeout(() => {
      editorRef.current?.scrollIntoView({
        block: "center",
      });
    }, 0);
  };

  useEffect(() => {
    if (parentEditorOpen && editorTarget) setEditorTarget(null);
  }, [parentEditorOpen, editorTarget]);

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
      ) : targetReplyId ? (
        <InitialReplyView
          post={post}
          parentComment={parentComment}
          targetReplyId={targetReplyId}
          onReplyClick={handleReplyClick}
        />
      ) : (
        <StandardRepliesView
          post={post}
          parentComment={parentComment}
          showReplies={showReplies}
          onReplyClick={handleReplyClick}
        />
      )}

      {newLocalReplies.length > 0 &&
        newLocalReplies.map((r) => (
          <div ref={(el) => setRef(el, r.id)} key={r.id}>
            <Reply
              reply={r}
              post={post}
              key={r.id}
              className="mt-3"
              parentCommentId={parentComment.id}
              onReplyClick={handleReplyClick}
            />
          </div>
        ))}

      {editorTarget && (
        <div ref={editorRef} className="mt-3 mb-3.5 w-full">
          <ReplyCreator
            key={editorKey}
            post={post}
            parentCommentId={editorTarget.parentCommentId}
            replyingToId={editorTarget.id}
            replyingToUser={editorTarget.reply.user}
            onReplySuccess={() => setEditorTarget(null)}
          />
        </div>
      )}
    </div>
  );
}
