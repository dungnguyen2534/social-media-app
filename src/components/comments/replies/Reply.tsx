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
import { useEffect, useState } from "react";
import CommentMoreButton from "../CommentMoreButton";
import ReplyEditor from "./ReplyEditor";

interface ReplyProps {
  post: PostData;
  reply: CommentData;
  parentCommentId: string;
  className?: string;
  onReplyClick: (reply: CommentData) => void;
  isTarget?: boolean;
}

export default function Reply({
  post,
  reply,
  parentCommentId,
  className,
  onReplyClick,
  isTarget = false,
}: ReplyProps) {
  const session = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (isTarget) {
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isTarget]);

  return (
    <div>
      {isEditing ? (
        <ReplyEditor
          reply={reply}
          parentCommentId={parentCommentId}
          onOpenChange={setIsEditing}
        />
      ) : (
        <div className={className}>
          <div className="group/reply flex gap-3">
            <MiniProfile user={reply.user}>
              <Link href={`/users/${reply.user.username}`}>
                <UserAvatar avatarUrl={reply.user.image} />
              </Link>
            </MiniProfile>
            <div className="w-fit">
              <div>
                <div
                  className={cn(
                    "bg-accent relative min-h-9 w-full px-3 py-2 shadow-sm",
                    reply.gif && !reply.content ? "rounded-t-md" : "rounded-md",
                    isHighlighted && "outline-primary outline-2",
                  )}
                >
                  <MiniProfile user={reply.user}>
                    <Link
                      href={`/users/${reply.user.username}`}
                      className="font-medium"
                    >
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
                      className={
                        reply.content ? "mt-1 rounded-md" : "rounded-b-md"
                      }
                    />
                  </div>
                )}
              </div>
            </div>
            <CommentMoreButton
              forReply
              comment={reply}
              setIsEditing={setIsEditing}
              setIsDeleting={setIsDeleting}
              className={cn(
                "group/reply -ml-2 opacity-0 lg:pointer-events-none",
                reply.gif ? "mt-0.5" : "self-center",
                session &&
                  session.user.id === reply.userId &&
                  "opacity-100 lg:group-hover/reply:pointer-events-auto lg:group-hover/reply:opacity-100",
              )}
            />
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
                disabled={!session || isDeleting}
              />
              <button
                className="hover:text-primary cursor-pointer"
                onClick={() => onReplyClick(reply)}
                disabled={!session || isDeleting}
              >
                Reply
              </button>

              <time dateTime={reply.createdAt.toDateString()}>
                {formatRelativeDate(reply.createdAt, true)}

                {reply.createdAt.getTime() !== reply.updatedAt.getTime() && (
                  <> (edited)</>
                )}
              </time>

              <CommentLikeCount count={reply._count.likes} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
