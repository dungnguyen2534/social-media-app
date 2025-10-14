"use client";

import { CommentData, PostData } from "@/lib/type";
import UserAvatar from "../../common/UserAvatar";
import { cn, formatNumber, formatRelativeDate } from "@/lib/utils";
import Linkify from "../../common/Linkify";
import { MiniProfile } from "../../common/MiniProfile";
import Link from "next/link";
import { useState } from "react";
import ReplyEditor from "./ReplyEditor";
import { Heart } from "lucide-react";
import { useAuth } from "@/app/auth-context";
import ReplyLikeButton from "./ReplyLikeButton";

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
  const session = useAuth();
  const [showReplyEditor, setShowReplyEditor] = useState(false);

  return (
    <div className={cn("flex gap-3", className)}>
      <MiniProfile user={reply.user}>
        <Link href={`/users/${reply.userId}`}>
          <UserAvatar avatarUrl={reply.user.image} />
        </Link>
      </MiniProfile>
      <div className="flex-1">
        <div className="bg-accent relative min-h-9 w-fit rounded-md px-3 py-2 shadow-sm">
          <MiniProfile user={reply.user}>
            <Link href={`/users/${reply.userId}`} className="font-medium">
              {reply.user.username}
            </Link>
          </MiniProfile>

          <Linkify>
            <p className="text-base break-words break-all whitespace-pre-line">
              {reply.content}
            </p>
          </Linkify>

          {reply._count.likes > 0 && (
            <span className="bg-card absolute -right-3 -bottom-1 flex items-center justify-center gap-1 rounded-full px-1.5 text-xs shadow-sm outline-black/20 dark:outline-1">
              <Heart className="size-3 fill-red-500 text-red-500" />
              {formatNumber(reply._count.likes)}
            </span>
          )}
        </div>

        <div className="text-muted-foreground mt-1.5 w-full space-x-3 text-xs">
          <ReplyLikeButton
            postId={post.id}
            replyId={reply.id}
            parentCommentId={parentCommentId}
            initialState={{
              likes: reply._count.likes,
              isLikedByUser: reply.likes.some(
                (like) => like.userId === session?.user.id,
              ),
            }}
          />
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
