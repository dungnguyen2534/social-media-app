"use client";

import { CommentData, PostData } from "@/lib/type";
import UserAvatar from "../common/UserAvatar";
import { cn, formatNumber, formatRelativeDate } from "@/lib/utils";
import Linkify from "../common/Linkify";
import { MiniProfile } from "../common/MiniProfile";
import Link from "next/link";
import Replies from "./replies/Replies";
import { useState } from "react";
import ReplyEditor from "./replies/ReplyEditor";
import { CommentContextProvider } from "./comment-context";
import { useAuth } from "@/app/auth-context";
import CommentLikeButton from "./CommentLikeButton";
import { Heart } from "lucide-react";

interface CommentProps {
  post: PostData;
  comment: CommentData;
  className?: string;
}

export default function Comment({ post, comment, className }: CommentProps) {
  const session = useAuth();

  const targetParentCommentId = comment.parentCommentId || comment.id;
  const [showReplyEditor, setShowReplyEditor] = useState(false);

  return (
    <CommentContextProvider>
      <div className={cn("flex gap-3", className)}>
        <MiniProfile user={comment.user}>
          <Link href={`/users/${comment.userId}`}>
            <UserAvatar avatarUrl={comment.user.image} />
          </Link>
        </MiniProfile>
        <div className="flex-1">
          <div className="bg-accent relative min-h-9 w-fit rounded-md px-3 py-2 shadow-sm">
            <MiniProfile user={comment.user}>
              <Link href={`/users/${comment.userId}`} className="font-medium">
                {comment.user.username}
              </Link>
            </MiniProfile>

            <Linkify>
              <p className="text-base break-words break-all whitespace-pre-line">
                {comment.content}
              </p>
            </Linkify>

            {comment._count.likes > 0 && (
              <span className="bg-card absolute -right-3 -bottom-2 flex items-center justify-center gap-1 rounded-full px-1.5 text-xs shadow-sm outline-black/20 dark:outline-1">
                <Heart className="size-3 fill-red-500 text-red-500" />
                {formatNumber(comment._count.likes)}
              </span>
            )}
          </div>

          <div className="text-muted-foreground mt-1.5 w-full space-x-3 text-xs">
            <CommentLikeButton
              postId={post.id}
              commentId={comment.id}
              initialState={{
                likes: comment._count.likes,
                isLikedByUser: comment.likes.some(
                  (like) => like.userId === session?.user.id,
                ),
              }}
            />
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
