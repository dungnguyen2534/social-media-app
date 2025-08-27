import Link from "next/link";
import UserAvatar from "../common/UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { PostData } from "@/lib/type";
import PostMoreButton from "./PostMoreButton";

interface PostProps {
  post: PostData;
  className?: string;
}

export default function Post({ post, className }: PostProps) {
  return (
    <article
      className={cn(
        "round bg-card group/post space-y-3 rounded-md p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/users/${post.user.username}`}>
          <UserAvatar avatarUrl={post.user.image} />
        </Link>
        <div className="h-9">
          <Link
            className="block text-sm font-medium hover:underline"
            href={`/users/${post.user.username}`}
          >
            {post.user.name}
          </Link>
          <time
            dateTime={post.createdAt.toDateString()}
            className="text-muted-foreground block text-xs"
          >
            {formatRelativeDate(post.createdAt)}
          </time>
        </div>

        <PostMoreButton
          post={post}
          className="-mt-5 ml-auto opacity-0 transition-opacity group-hover/post:opacity-100"
        />
      </div>
      <div className="break-words whitespace-pre-line">{post.content}</div>
    </article>
  );
}
