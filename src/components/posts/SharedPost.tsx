"use client";

import Link from "next/link";
import UserAvatar from "../common/UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { SharedPostData } from "@/lib/type";
import Linkify from "../common/Linkify";
import { MiniProfile } from "../common/MiniProfile";
import MediaView from "./MediaView";

interface SharedPostProps {
  post: SharedPostData;
  className?: string;
  noMiniProfile?: boolean;
}

export default function SharedPost({
  post,
  className,
  noMiniProfile,
}: SharedPostProps) {
  return (
    <article
      className={cn(
        "round bg-card overflow-hidden rounded-md border-1",
        className,
      )}
    >
      {!!post.attachments.length && (
        <MediaView attachments={post.attachments} className="mb-2" />
      )}

      <div className={cn("p-3", !!post.attachments.length && "pt-1")}>
        {noMiniProfile ? (
          <div className="mb-2 flex items-center">
            <Link
              className="group flex flex-wrap items-center gap-2"
              href={`/users/${post.user.username}`}
            >
              <div>
                <UserAvatar avatarUrl={post.user.image} />
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
          </div>
        ) : (
          <div className="mb-2 flex items-center">
            <MiniProfile user={post.user}>
              <Link
                className="group flex flex-wrap items-center gap-2"
                href={`/users/${post.user.username}`}
              >
                <div>
                  <UserAvatar avatarUrl={post.user.image} />
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
          </div>
        )}

        <Linkify>
          <div className="text-base wrap-anywhere whitespace-pre-line">
            {post.content}
          </div>
        </Linkify>
      </div>
    </article>
  );
}
