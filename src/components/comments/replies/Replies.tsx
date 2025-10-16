"use client";

import { CommentData, CommentsPage, PostData } from "@/lib/type";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/ky";
import Reply from "./Reply";
import { useCommentContext } from "../comment-context";
import CommentSkeletons from "../CommentSkeletons";
import ReplyEditor from "./ReplyCreator";

interface RepliesProps {
  post: PostData;
  parentComment: CommentData;
  parentEditorOpen: boolean;
  setParentEditorOpen: (open: boolean) => void;
}

export default function Replies({
  post,
  parentComment,
  parentEditorOpen,
  setParentEditorOpen,
}: RepliesProps) {
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
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });

  const fetchedReplies = useMemo(
    () => data?.pages.flatMap((page) => page.comments) || [],
    [data?.pages],
  );

  useEffect(() => {
    if (fetchedReplies.length > 0 && newLocalReplies.length > 0) {
      const fetchedReplyIds = new Set(fetchedReplies.map((r) => r.id));

      const filterednewLocalReplies = newLocalReplies.filter(
        (newReply) => !fetchedReplyIds.has(newReply.id),
      );

      if (filterednewLocalReplies.length !== newLocalReplies.length) {
        setNewLocalReplies(filterednewLocalReplies);
      }
    }
  }, [fetchedReplies, setNewLocalReplies, newLocalReplies]);

  // Focus on new reply
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

  // Editor behavior
  const [editorTarget, setEditorTarget] = useState<{
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
    setEditorTarget({ reply, parentCommentId: parentComment.id });
    setEditorKey((prev) => prev + 1); // Forces remount and focus
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
                  onReplyClick={handleReplyClick}
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
          <ReplyEditor
            key={editorKey}
            post={post}
            parentCommentId={editorTarget.parentCommentId}
            replyingToUser={editorTarget.reply.user}
            onReplySuccess={() => setEditorTarget(null)}
          />
        </div>
      )}
    </div>
  );
}
