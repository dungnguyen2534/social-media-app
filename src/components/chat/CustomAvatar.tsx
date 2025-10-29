import Link from "next/link";
import { AvatarProps } from "stream-chat-react";
import UserAvatar from "../common/UserAvatar";

export default function CustomAvatar({ image, user }: AvatarProps) {
  return (
    <div className="str-chat__avatar str-chat__message-sender-avatar str-chat__avatar--one-letter">
      {user ? (
        <Link href={`/users/${user.username}`}>
          <UserAvatar avatarUrl={image} className="ring-card ring-1" />
        </Link>
      ) : (
        <div>
          <UserAvatar avatarUrl={image} className="ring-card size-10 ring-1" />
        </div>
      )}
    </div>
  );
}
