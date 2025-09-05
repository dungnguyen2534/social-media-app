import { UserRound } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  className?: string;
  iconSize?: string;
}

export default function UserAvatar({
  avatarUrl,
  className,
  iconSize = "size-5",
}: UserAvatarProps) {
  return (
    <Avatar className={cn("size-9", className)}>
      <AvatarImage src={avatarUrl ?? ""} />
      <AvatarFallback>
        <UserRound className={iconSize} />
      </AvatarFallback>
    </Avatar>
  );
}
