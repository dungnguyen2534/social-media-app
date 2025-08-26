import { UserRound } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  className?: string;
}

export default function UserAvatar({ avatarUrl, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl ?? ""} />
      <AvatarFallback>
        <UserRound className="size-4" />
      </AvatarFallback>
    </Avatar>
  );
}
