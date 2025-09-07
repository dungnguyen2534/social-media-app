import Link from "next/link";
import UserAvatar from "../common/UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { PostData } from "@/lib/type";
import PostMoreButton from "./PostMoreButton";
import Linkify from "../common/Linkify";
import { MiniProfile } from "../common/MiniProfile";

interface PostProps {
  post: PostData;
  className?: string;
}

export default function Post({ post, className }: PostProps) {
  return (
    <article
      className={cn(
        "round bg-card space-y-3 rounded-md p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center">
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

              <time
                dateTime={post.createdAt.toDateString()}
                className="text-muted-foreground block text-xs"
              >
                {formatRelativeDate(post.createdAt)}
              </time>
            </div>
          </Link>
        </MiniProfile>

        <PostMoreButton post={post} className="-mt-5 ml-auto" />
      </div>
      <Linkify>
        <div className="text-base break-words whitespace-pre-line">
          {post.content}
        </div>
      </Linkify>
    </article>
  );
}
