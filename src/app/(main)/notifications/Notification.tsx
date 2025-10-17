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
    { message: string; icon: JSX.Element | null; href: string }
  > = {
    LIKE: {
      message: "liked your post.",
      icon: <Heart className="dark:text-card size-4 fill-red-500 text-white" />,
      href: `/posts/${notification.postId}`,
    },
    COMMENT: {
      message: "commented on your post.",
      icon: (
        <MessageCircle className="dark:text-card size-4 fill-blue-500 text-white" />
      ),
      href: `/posts/${notification.postId}?priorityCommentId=${notification.commentId}`,
    },
    FOLLOW: {
      message: "started following you.",
      icon: (
        <Smile className="dark:text-card size-4 fill-green-500 text-white" />
      ),
      href: `/users/${notification.issuer.username}`,
    },
  };

  const { message, icon, href } = notificationTypeMap[notification.type];

  return (
    <Link
      href={href}
      className={cn(
        "bg-card relative mb-1 flex items-center gap-3 rounded-sm p-5 shadow-sm lg:mb-2",
        notification.read ? "bg-card" : "bg-accent",
        className,
      )}
    >
      <div className="relative">
        <UserAvatar avatarUrl={notification.issuer.image} className="size-12" />

        <div className="absolute -right-1 -bottom-0">{icon}</div>
      </div>

      <div>
        <div className="line-clamp-1">
          <span className="font-medium">{notification.issuer.username}</span>{" "}
          {message}
        </div>
        {notification.post?.content && (
          <div className="text-muted-foreground line-clamp-1 text-sm">
            {notification.recipient.username +
              ": " +
              notification.post?.content}
          </div>
        )}
      </div>
      <div className="text-muted-foreground absolute right-2.5 bottom-1.5 text-xs">
        {formatRelativeDate(notification.createdAt)}
      </div>
    </Link>
  );
}
