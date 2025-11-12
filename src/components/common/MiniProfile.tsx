"use client";

import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import UserAvatar from "./UserAvatar";
import FollowButton from "./FollowButton";
import { FollowerCount, FollowingCount } from "./FollowCount";
import { FollowerInfo, FollowingInfo, UserData } from "@/lib/type";
import { useAuth } from "@/app/auth-context";
import Linkify from "./Linkify";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/ky";
import { HTTPError } from "ky";

interface MiniProfileProps extends React.PropsWithChildren {
  user: UserData;
}

export function MiniProfile({ children, user }: MiniProfileProps) {
  const session = useAuth();
  const signedInUser = session?.user;

  const followerInfo: FollowerInfo = {
    followerCount: user._count.followers,
    isFollowing: signedInUser?.id
      ? user.followers.some(({ followerId }) => followerId === signedInUser?.id)
      : undefined,
  };

  const followingInfo: FollowingInfo = {
    followingCount: user._count.following,
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          className="w-fit max-w-64 space-y-3 p-3 pb-0 text-sm"
          sideOffset={5}
        >
          <div>
            <Link
              className="flex h-9 items-center gap-2"
              href={`/users/${user.username}`}
            >
              <UserAvatar avatarUrl={user.image} imagesize="45" />
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-muted-foreground">@{user.username}</div>
              </div>
            </Link>
          </div>
          {user.bio && (
            <Linkify>
              <p className="line-clamp-4 whitespace-pre-line">{user.bio}</p>
            </Linkify>
          )}

          <hr />
          <div className="flex justify-around gap-2">
            <FollowerCount userId={user.id} initialState={followerInfo} />
            <span>|</span>
            <FollowingCount userId={user.id} initialState={followingInfo} />
          </div>
          {user.id === signedInUser?.id ? (
            <Button className="w-full min-w-52" variant="custom">
              <Link href={`/users/${user.username}`}>Your profile</Link>
            </Button>
          ) : (
            <>
              {signedInUser && (
                <FollowButton
                  user={user}
                  noDialog
                  initialState={followerInfo}
                  className="w-full min-w-52"
                />
              )}
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface MiniProfileOnTagProps extends React.PropsWithChildren {
  username: string;
}

export function MiniProfileOnTag({
  children,
  username,
}: MiniProfileOnTagProps) {
  const { data, isFetching } = useQuery({
    queryKey: ["user", username],
    queryFn: () => api.get(`users/username/${username}`).json<UserData>(),
    retry: (failureCount, error) => {
      if (error instanceof HTTPError && error.response.status === 404) {
        return false; // No retry on 404
      }

      return failureCount < 1;
    },
    staleTime: Infinity,
  });

  if (!data) {
    return (
      <Link
        href={`/users/${username}`}
        className="app-link"
        title={
          !isFetching && !data
            ? "This user doesn't exist or may have changed their username"
            : undefined
        }
      >
        {children}
      </Link>
    );
  }

  return (
    <MiniProfile user={data}>
      <Link href={`/users/${username}`} className="app-link">
        {children}
      </Link>
    </MiniProfile>
  );
}
