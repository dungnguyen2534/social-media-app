"use client";

import { useAuth } from "@/app/auth-context";
import FollowButton from "@/components/common/FollowButton";
import UserAvatar from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/type";
import Link from "next/link";

interface UserResultProps {
  user: UserData;
}

export default function UserResult({ user }: UserResultProps) {
  const session = useAuth();
  const signedInUser = session!.user;

  return (
    <div className="relative">
      <Link
        href={`/users/${user.username}`}
        className="bg-card dark:hover:ring-accent/80 hover:ring-accent-foreground/5 relative mb-1 flex items-center gap-3 overflow-hidden p-5 shadow-sm ring-2 ring-transparent transition-all lg:mb-2 lg:rounded-md"
      >
        <div className="flex w-full items-center gap-2">
          <UserAvatar
            avatarUrl={user.image}
            className="size-12"
            iconStyle="size-7"
          />

          <div className="space-y-1">
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>
        </div>
      </Link>

      {user.id !== signedInUser.id! ? (
        <FollowButton
          user={user}
          initialState={{
            followerCount: user._count.followers,
            isFollowing: signedInUser.id!
              ? user.followers.some(
                  ({ followerId }) => followerId === signedInUser.id!,
                )
              : undefined,
          }}
          className="absolute top-1/2 right-5 w-28 -translate-y-1/2"
        />
      ) : (
        <Button
          className="absolute top-1/2 right-5 w-28 -translate-y-1/2"
          variant="custom"
          asChild
        >
          <Link href={`/users/${signedInUser.username!}`}>Your profile</Link>
        </Button>
      )}
    </div>
  );
}
