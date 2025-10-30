import UserAvatar from "@/components/common/UserAvatar";
import { NotificationData } from "@/lib/type";
import { cn, formatRelativeDate } from "@/lib/utils";
import { NotificationType } from "@prisma/client";
import { Heart, MessageCircle, Smile } from "lucide-react";
import Link from "next/link";
import { JSX } from "react";

interface NotificationProps {
  notification: NotificationData;
  className?: string;
}

export default function Notification({
  notification,
  className,
}: NotificationProps) {
  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: JSX.Element | null; color: string; href: string }
  > = {
    LIKE: {
      message: "liked your post.",
      icon: <Heart className="dark:text-card size-4 fill-red-500 text-white" />,
      href: `/posts/${notification.postId}`,
      color: "bg-red-500",
    },
    COMMENT: {
      message: `commented on your post: ${notification.comment?.content}`,
      icon: (
        <MessageCircle className="dark:text-card size-4 fill-blue-500 text-white" />
      ),
      href: `/posts/${notification.postId}?targetCommentId=${notification.commentId}`,
      color: "bg-blue-500",
    },
    FOLLOW: {
      message: "started following you.",
      icon: (
        <Smile className="dark:text-card size-4 fill-green-500 text-white" />
      ),
      href: `/users/${notification.issuer.username}`,
      color: "bg-green-500",
    },
    LIKE_COMMENT: {
      message: "liked your comment.",
      icon: <Heart className="dark:text-card size-4 fill-red-500 text-white" />,
      href: `/posts/${notification.postId}?targetCommentId=${notification.commentId}`,
      color: "bg-red-500",
    },
    LIKE_REPLY: {
      message: "liked your reply in a comment thread.",
      icon: <Heart className="dark:text-card size-4 fill-red-500 text-white" />,
      href: `/posts/${notification.postId}?targetCommentId=${notification.comment?.parentCommentId}&targetReplyId=${notification.comment?.id}`,
      color: "bg-red-500",
    },
    REPLY_TO_COMMENT: {
      message: `reply to your comment: ${notification.comment?.content}`,
      icon: (
        <MessageCircle className="dark:text-card size-4 fill-blue-500 text-white" />
      ),
      href: `/posts/${notification.postId}?targetCommentId=${notification.comment?.parentCommentId}&targetReplyId=${notification.comment?.id}`,
      color: "bg-blue-500",
    },
    REPLY_TO_REPLY: {
      message: `reply to you in a comment thread: ${notification.comment?.content}`,
      icon: (
        <MessageCircle className="dark:text-card size-4 fill-blue-500 text-white" />
      ),
      href: `/posts/${notification.postId}?targetCommentId=${notification.comment?.parentCommentId}&targetReplyId=${notification.comment?.id}`,
      color: "bg-blue-500",
    },
  };

  const { message, icon, href, color } = notificationTypeMap[notification.type];

  return (
    <Link
      href={href}
      className={cn(
        "bg-card dark:hover:ring-accent/80 hover:ring-accent-foreground/5 relative mb-1 flex items-center gap-3 overflow-hidden p-5 shadow-sm ring-2 ring-transparent transition-all lg:mb-2 lg:rounded-md",
        className,
      )}
    >
      {!notification.read && (
        <div className={`absolute -left-10 h-full w-1/12 ${color}`}></div>
      )}

      <div className="relative">
        <UserAvatar avatarUrl={notification.issuer.image} className="size-12" />

        <div className="absolute -right-1 -bottom-0">{icon}</div>
      </div>

      <div>
        <div className="line-clamp-1">
          <span className="font-medium">{notification.issuer.username}</span>{" "}
          {message}
        </div>
        {(notification.type === "LIKE" || notification.type === "COMMENT") &&
          notification.post?.content && (
            <div className="text-muted-foreground line-clamp-1 text-sm">
              {notification.post?.content}
            </div>
          )}
        {(notification.type === "LIKE_COMMENT" ||
          notification.type === "LIKE_REPLY") &&
          notification.comment?.content && (
            <div className="text-muted-foreground line-clamp-1 text-sm">
              {notification.comment?.content}
            </div>
          )}
        {(notification.type === "REPLY_TO_COMMENT" ||
          notification.type === "REPLY_TO_REPLY") &&
          notification.comment?.replyingTo?.content && (
            <div className="text-muted-foreground line-clamp-1 text-sm">
              {notification.comment?.replyingTo?.content}
            </div>
          )}
      </div>
      <div className="text-muted-foreground absolute right-2.5 bottom-1.5 text-xs">
        {formatRelativeDate(notification.createdAt)}
      </div>
    </Link>
  );
}
