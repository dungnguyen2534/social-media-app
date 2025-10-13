"use client";

import { CommentData, PostData } from "@/lib/type";
import UserAvatar from "../common/UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import Linkify from "../common/Linkify";
import { MiniProfile } from "../common/MiniProfile";
import Link from "next/link";
import { useState } from "react";
import ReplyEditor from "./ReplyEditor";

interface ReplyProps {
  post: PostData;
  reply: CommentData;
  parentCommentId: string;
  className?: string;
}

export default function Reply({
  post,
  reply,
  parentCommentId,
  className,
}: ReplyProps) {
  const [showReplyEditor, setShowReplyEditor] = useState(false);

  return (
    <div className={cn("flex gap-3", className)}>
      <MiniProfile user={reply.user}>
        <Link href={`/users/${reply.userId}`}>
          <UserAvatar avatarUrl={reply.user.image} />
        </Link>
      </MiniProfile>
      <div className="flex-1">
        <div className="bg-accent min-h-9 w-fit rounded-md px-3 py-2 shadow-sm">
          <MiniProfile user={reply.user}>
            <Link href={`/users/${reply.userId}`} className="font-medium">
              {reply.user.username}
            </Link>
          </MiniProfile>

          <Linkify>
            <p className="text-base break-words whitespace-pre-line">
              {reply.content}
            </p>
          </Linkify>
        </div>

        <div className="text-muted-foreground mt-1 w-full space-x-3 text-xs">
          <button className="hover:text-primary cursor-pointer">Like</button>
          <button
            className="hover:text-primary cursor-pointer"
            onClick={() => setShowReplyEditor((prev) => !prev)}
          >
            Reply
          </button>

          <time dateTime={reply.createdAt.toDateString()}>
            {formatRelativeDate(reply.createdAt)}
          </time>
        </div>

        {showReplyEditor && (
          <div className="w-full py-3">
            <ReplyEditor
              post={post}
              parentCommentId={parentCommentId}
              replyingToUser={reply.user}
              onReplySuccess={() => {
                setShowReplyEditor(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
