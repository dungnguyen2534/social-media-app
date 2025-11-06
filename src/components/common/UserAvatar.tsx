import { UserRound } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  className?: string;
  iconStyle?: string;
  imagesize?: string;
}

export default function UserAvatar({
  avatarUrl,
  className,
  iconStyle = "size-5",
  imagesize,
}: UserAvatarProps) {
  return (
    <Avatar className={cn("size-9", className)}>
      <AvatarImage src={avatarUrl ?? ""} alt="User Avatar" sizes={imagesize} />
      <AvatarFallback>
        <UserRound className={iconStyle} />
      </AvatarFallback>
    </Avatar>
  );
}
