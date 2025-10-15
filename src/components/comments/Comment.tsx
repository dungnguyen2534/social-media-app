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
import Image from "next/image";

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
      <div className={className}>
        <div className="flex gap-3">
          <MiniProfile user={comment.user}>
            <Link href={`/users/${comment.userId}`}>
              <UserAvatar avatarUrl={comment.user.image} />
            </Link>
          </MiniProfile>
          <div className="w-fit">
            <div>
              <div
                className={cn(
                  "bg-accent relative min-h-9 w-full px-3 py-2",
                  comment.gif && !comment.content
                    ? "rounded-t-md"
                    : "rounded-md",
                )}
              >
                <MiniProfile user={comment.user}>
                  <Link
                    href={`/users/${comment.userId}`}
                    className="font-medium"
                  >
                    {comment.user.username}
                  </Link>
                </MiniProfile>

                <Linkify>
                  <p className="text-base break-words break-all whitespace-pre-line">
                    {comment.content}
                  </p>
                </Linkify>
              </div>

              {comment.gif && (
                <div className="relative">
                  <Image
                    alt={comment.gif.title || "gif"}
                    src={comment.gif.url}
                    width={comment.gif.width}
                    height={comment.gif.height}
                    key={comment.gif.id}
                    className={
                      comment.content ? "mt-1 rounded-md" : "rounded-b-md"
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-1.5 ml-12">
          <div className="text-muted-foreground flex items-center gap-3 text-xs">
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

            <CommentLikeCount count={comment._count.likes} />
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

interface CommentLikeCountProps {
  count: number;
  className?: string;
}

function CommentLikeCount({ count, className }: CommentLikeCountProps) {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        "bg-card dark:bg-background/35 flex w-fit items-center justify-center gap-1 rounded-full px-1.5 text-xs shadow-sm outline-black/15 dark:outline-1",
        className,
      )}
    >
      <Heart className="size-3 fill-red-500 text-red-500" />
      {formatNumber(count)}
    </span>
  );
}
