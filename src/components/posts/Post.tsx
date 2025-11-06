"use client";

import Link from "next/link";
import UserAvatar from "../common/UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { PostData } from "@/lib/type";
import PostMoreButton from "./PostMoreButton";
import Linkify from "../common/Linkify";
import { MiniProfile } from "../common/MiniProfile";
import LikeButton from "./LikeButton";
import { useAuth } from "@/app/auth-context";
import BookmarkButton from "./BookmarkButton";
import ShareButton from "./ShareButton";
import MediaView from "./MediaView";
import SharedPost from "./SharedPost";
import CommentButton from "./CommentButton";

interface PostProps {
  post: PostData;
  className?: string;
  noCommentButton?: boolean;
  postMoreButtonStyle?: string;
  imagePriority?: boolean;
}

export default function Post({
  post,
  className,
  noCommentButton,
  postMoreButtonStyle,
  imagePriority,
}: PostProps) {
  const session = useAuth();

  return (
    <article
      className={cn(
        "round bg-card p-2.5 pt-3 pb-1.5 shadow-sm lg:rounded-md lg:p-5 lg:pb-2",
        className,
      )}
    >
      <div className="mb-2 flex items-center">
        <MiniProfile user={post.user}>
          <Link
            className="group flex flex-wrap items-center gap-2"
            href={`/users/${post.user.username}`}
          >
            <div>
              <UserAvatar avatarUrl={post.user.image} imagesize="45" />
            </div>
            <div className="h-9">
              <div className="flex gap-1">
                <div className="block font-medium underline-offset-2 group-hover:underline">
                  {post.user.name}
                </div>
                <div className="text-muted-foreground">
                  @{post.user.username}
                </div>
              </div>

              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <time dateTime={post.createdAt.toDateString()}>
                  {formatRelativeDate(post.createdAt)}
                </time>

                {post.createdAt.getTime() !== post.updatedAt.getTime() && (
                  <>(edited)</>
                )}
              </div>
            </div>
          </Link>
        </MiniProfile>

        <PostMoreButton
          post={post}
          className={cn("-mt-5 ml-auto", postMoreButtonStyle)}
        />
      </div>
      <Linkify>
        <p className="my-1 text-base break-words break-all whitespace-pre-line">
          {post.content}
        </p>
      </Linkify>

      {!!post.attachments.length && (
        <MediaView
          attachments={post.attachments}
          className="my-1 rounded-md"
          priority={imagePriority}
        />
      )}

      {!!post.sharedPost && <SharedPost post={post.sharedPost} />}

      <hr className="my-2" />
      <div className="flex justify-between">
        <div className="flex w-fit gap-1">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some(
                (like) => like.userId === session?.user.id,
              ),
            }}
            disabled={!session}
          />

          {!noCommentButton && (
            <CommentButton post={post} disabled={!session} />
          )}
        </div>

        <div>
          <ShareButton
            post={!!post.sharedPost ? post.sharedPost : post}
            disabled={!session}
          />
          <BookmarkButton
            postId={post.id}
            initialState={{
              isBookmarkedByUser: post.bookmarks.some(
                (bookmark) => bookmark.userId === session?.user.id,
              ),
            }}
            disabled={!session}
          />
        </div>
      </div>
    </article>
  );
}
