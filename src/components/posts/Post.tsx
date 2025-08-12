import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { PostData } from "@/lib/type";

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
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/users/${post.user.username}`}>
          <UserAvatar avatarUrl={post.user.image} />
        </Link>
        <div>
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
      </div>
      <div className="break-words whitespace-pre-line">{post.content}</div>
    </article>
  );
}
