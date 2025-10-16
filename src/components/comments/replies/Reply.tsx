"use client";

import { CommentData, PostData } from "@/lib/type";
import UserAvatar from "../../common/UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import Linkify from "../../common/Linkify";
import { MiniProfile } from "../../common/MiniProfile";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";
import ReplyLikeButton from "./ReplyLikeButton";
import Image from "next/image";
import CommentLikeCount from "../CommentLikeCount";

interface ReplyProps {
  post: PostData;
  reply: CommentData;
  parentCommentId: string;
  className?: string;
  onReplyClick: (reply: CommentData) => void;
}

export default function Reply({
  post,
  reply,
  parentCommentId,
  className,
  onReplyClick,
}: ReplyProps) {
  const session = useAuth();

  return (
    <div className={className}>
      <div className="flex gap-3">
        <MiniProfile user={reply.user}>
          <Link href={`/users/${reply.userId}`}>
            <UserAvatar avatarUrl={reply.user.image} />
          </Link>
        </MiniProfile>
        <div className="w-fit">
          <div>
            <div
              className={cn(
                "bg-accent relative min-h-9 w-full px-3 py-2",
                reply.gif && !reply.content ? "rounded-t-md" : "rounded-md",
              )}
            >
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
            </div>

            {reply.gif && (
              <div className="relative">
                <Image
                  alt={reply.gif.title || "gif"}
                  src={reply.gif.url}
                  width={reply.gif.width}
                  height={reply.gif.height}
                  key={reply.gif.id}
                  className={reply.content ? "mt-1 rounded-md" : "rounded-b-md"}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-1.5 ml-12">
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
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
            onClick={() => onReplyClick(reply)}
            disabled={!session}
          >
            Reply
          </button>

          <time dateTime={reply.createdAt.toDateString()}>
            {formatRelativeDate(reply.createdAt)}
          </time>

          <CommentLikeCount count={reply._count.likes} />
        </div>
      </div>
    </div>
  );
}
