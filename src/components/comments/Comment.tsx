"use client";

import { CommentData, PostData } from "@/lib/type";
import UserAvatar from "../common/UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import Linkify from "../common/Linkify";
import { MiniProfile } from "../common/MiniProfile";
import Link from "next/link";
import Replies from "./replies/Replies";
import { useEffect, useRef, useState } from "react";
import ReplyEditor from "./replies/ReplyCreator";
import { CommentContextProvider } from "./comment-context";
import { useAuth } from "@/app/auth-context";
import CommentLikeButton from "./CommentLikeButton";
import Image from "next/image";
import CommentLikeCount from "./CommentLikeCount";
import CommentMoreButton from "./CommentMoreButton";
import CommentEditor from "./CommentEditor";

interface CommentProps {
  post: PostData;
  comment: CommentData;
  className?: string;
}

export default function Comment({ post, comment, className }: CommentProps) {
  const session = useAuth();

  const targetParentCommentId = comment.parentCommentId || comment.id;
  const [showReplyEditor, setShowReplyEditor] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showReplyEditor && editorRef.current) {
      editorRef.current.scrollIntoView({
        block: "center",
      });
    }
  }, [showReplyEditor]);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <CommentContextProvider>
      {isEditing ? (
        <CommentEditor
          comment={comment}
          postId={post.id}
          onOpenChange={setIsEditing}
        />
      ) : (
        <div className={className}>
          <div className="group/comment flex gap-3">
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

            <CommentMoreButton
              comment={comment}
              setIsEditing={setIsEditing}
              setIsDeleting={setIsDeleting}
              className={cn(
                "group/comment -ml-2 opacity-0 lg:pointer-events-none",
                comment.gif ? "mt-0.5" : "self-center",
                session &&
                  session.user.id === comment.userId &&
                  "opacity-100 lg:group-hover/comment:pointer-events-auto lg:group-hover/comment:opacity-100",
              )}
              disabled={!session || isDeleting}
            />
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
                disabled={!session || isDeleting}
              />
              <button
                className="hover:text-primary cursor-pointer"
                onClick={() => setShowReplyEditor((prev) => !prev)}
                disabled={!session || isDeleting}
              >
                Reply
              </button>

              <time dateTime={comment.createdAt.toDateString()}>
                {formatRelativeDate(comment.createdAt)}
              </time>

              <CommentLikeCount count={comment._count.likes} />
            </div>

            <Replies
              post={post}
              parentComment={comment}
              parentEditorOpen={showReplyEditor}
              setParentEditorOpen={setShowReplyEditor}
            />

            {showReplyEditor && (
              <div ref={editorRef} className="mt-3 mb-3.5 w-full">
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
          </div>
        </div>
      )}
    </CommentContextProvider>
  );
}
