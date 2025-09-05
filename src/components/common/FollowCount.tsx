"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import useFollowingInfo from "@/hooks/useFollowingInfo";
import { FollowerInfo, FollowingInfo } from "@/lib/type";
import { formatNumber } from "@/lib/utils";
import { Heart, UsersRound } from "lucide-react";

interface FollowerCountProps {
  userId: string;
  initialState: FollowerInfo;
}

export function FollowerCount({ userId, initialState }: FollowerCountProps) {
  const { data } = useFollowerInfo(userId, initialState);

  return (
    <div className="flex items-center justify-center gap-1">
      <UsersRound size={17} className="mt-[0.1rem]" />
      {formatNumber(data.followerCount)} followers
    </div>
  );
}

interface FollowingCountProps {
  userId: string;
  initialState: FollowingInfo;
}

export function FollowingCount({ userId, initialState }: FollowingCountProps) {
  const { data } = useFollowingInfo(userId, initialState);

  return (
    <div className="flex items-center justify-center gap-1">
      <Heart size={17} className="mt-[0.1rem]" />
      {formatNumber(data.followingCount)} following
    </div>
  );
}
