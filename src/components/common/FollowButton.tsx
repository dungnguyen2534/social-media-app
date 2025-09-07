"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import api from "@/lib/ky";
import { FollowerInfo, FollowingInfo } from "@/lib/type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/app/auth-context";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
  className?: string;
}

export default function FollowButton({
  userId,
  initialState,
  className,
}: FollowButtonProps) {
  const { data } = useFollowerInfo(userId, initialState);
  const session = useAuth();
  const signedInUserId = session?.user.id;

  const queryClient = useQueryClient();
  const followerQueryKey = ["follower-info", userId];
  const followingQueryKey = ["following-info", signedInUserId];

  const { mutate } = useMutation({
    mutationFn: () => {
      return data.isFollowing
        ? api.delete(`users/id/${userId}/followers`)
        : api.post(`users/id/${userId}/followers`);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: followerQueryKey });
      await queryClient.cancelQueries({ queryKey: followingQueryKey });

      const prevFollowerState =
        queryClient.getQueryData<FollowerInfo>(followerQueryKey);
      const prevFollowingState =
        queryClient.getQueryData<FollowingInfo>(followingQueryKey);

      queryClient.setQueryData<FollowerInfo>(followerQueryKey, () => ({
        followerCount:
          (prevFollowerState?.followerCount || 0) +
          (prevFollowerState?.isFollowing ? -1 : 1),
        isFollowing: !prevFollowerState?.isFollowing,
      }));

      queryClient.setQueryData<FollowingInfo>(followingQueryKey, () => ({
        followingCount:
          (prevFollowingState?.followingCount || 0) +
          (!prevFollowerState?.isFollowing ? 1 : -1),
      }));

      return { prevFollowerState, prevFollowingState };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(followerQueryKey, context?.prevFollowerState);
      queryClient.setQueryData(followingQueryKey, context?.prevFollowingState);

      console.log(error);
      toast.error("Something went wrong, please try gain.");
    },
  });

  return (
    <Button
      variant={data.isFollowing ? "secondary" : "outline"}
      onClick={() => mutate()}
      className={className}
    >
      {data.isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
