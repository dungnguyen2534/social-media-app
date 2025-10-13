"use client";

import { CommentData, PostData } from "@/lib/type";
import UserAvatar from "../common/UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import Linkify from "../common/Linkify";
import { MiniProfile } from "../common/MiniProfile";
import Link from "next/link";
import Replies from "./Replies";
import { useState } from "react";
import ReplyEditor from "./ReplyEditor";
import { CommentContextProvider } from "./comment-context";
import { useAuth } from "@/app/auth-context";

interface CommentProps {
  post: PostData;
  comment: CommentData;
  className?: string;
}

export default function Comment({ post, comment, className }: CommentProps) {
  const targetParentCommentId = comment.parentCommentId || comment.id;
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const session = useAuth();

  return (
    <CommentContextProvider>
      <div className={cn("flex gap-3", className)}>
        <MiniProfile user={comment.user}>
          <Link href={`/users/${comment.userId}`}>
            <UserAvatar avatarUrl={comment.user.image} />
          </Link>
        </MiniProfile>
        <div className="flex-1">
          <div className="bg-accent min-h-9 w-fit rounded-md px-3 py-2 shadow-sm">
            <MiniProfile user={comment.user}>
              <Link href={`/users/${comment.userId}`} className="font-medium">
                {comment.user.username}
              </Link>
            </MiniProfile>

            <Linkify>
              <p className="text-base break-words whitespace-pre-line">
                {comment.content}
              </p>
            </Linkify>
          </div>

          <div className="text-muted-foreground mt-1 w-full space-x-3 text-xs">
            <button
              className="hover:text-primary cursor-pointer"
              disabled={!session}
            >
              Like
            </button>
            <button
              className="hover:text-primary cursor-pointer"
              onClick={() => setShowReplyEditor((prev) => !prev)}
              disabled={!session}
            >
              Reply
            </button>

            <time dateTime={comment.createdAt.toDateString()}>
              {formatRelativeDate(comment.createdAt)}
            </time>
          </div>

          {showReplyEditor && (
            <div className="w-full py-3">
              <ReplyEditor
                post={post}
                parentCommentId={targetParentCommentId}
                replyingToUser={comment.user}
                onReplySuccess={() => {
                  setShowReplyEditor(false);
                }}
              />
            </div>
          )}

          <Replies post={post} parentComment={comment} />
        </div>
      </div>
    </CommentContextProvider>
  );
}
